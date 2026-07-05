import { APIError, type CollectionConfig, type Where } from 'payload'


import { admins, getRole, isAdminRole } from '@/access/roles'
import { gradeOptions } from '@/fields/gradeOptions'
import { paymentStatusOptions } from '@/fields/paymentStatusOptions'
import {
  normalizeEnrollmentEmail,
  normalizeEnrollmentPhone,
  normalizeEnrollmentText,
} from '@/utilities/enrollmentValidation'
import { formatStudentId, normalizeStudentId } from '@/utilities/studentCardNumber'

const classCategoryToGrade = {
  grade_6: 'Grade 6',
  grade_7: 'Grade 7',
  grade_8: 'Grade 8',
  grade_9: 'Grade 9',
  grade_10: 'Grade 10',
  grade_11: 'Grade 11',
} as const

const getRelationID = (value: unknown): string | number | undefined => {
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'string' || typeof id === 'number' ? id : undefined
  }

  if (value && typeof value === 'object' && 'value' in value) {
    return getRelationID((value as { value?: unknown }).value)
  }

  return typeof value === 'string' || typeof value === 'number' ? value : undefined
}

const normalizeTemporaryPassword = (value: unknown) => String(value || '').trim()

export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  labels: {
    singular: 'Enrollment',
    plural: 'Enrollments',
  },
  admin: {
    group: 'Institute',
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'cardNumber', 'class', 'phone', 'status', 'paymentStatus', 'createdAt'],
  },
  access: {
    create: admins,
    delete: admins,
    read: ({ req }) => {
      if (isAdminRole(getRole(req.user))) return true
      if (!req.user?.id) return false
      return { user: { equals: req.user.id } }
    },
    update: admins,
  },
  fields: [
    {
      name: 'fullName',
      type: 'text',
      index: true,
      admin: { hidden: true },
    },
    {
      type: 'row',
      fields: [
        { name: 'student', type: 'relationship', relationTo: 'students', admin: { readOnly: true } },
        { name: 'user', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
        { name: 'class', type: 'relationship', relationTo: 'classes', required: true },
      ],
    },
    {
      name: 'cardNumber',
      type: 'text',
      label: 'Card No. (IEM No.)',
      index: true,
      admin: {
        description:
          'Required before approval. Assign once from enrollment only; stored as IEM0051 and locked after save.',
        condition: (data, siblingData, { operation }) => {
          if (operation === 'create') return true
          return !siblingData?.student
        },
      },
    },
    {
      name: 'cardNumberLocked',
      type: 'text',
      virtual: true,
      label: 'Card No. (IEM No.)',
      admin: {
        condition: (data, siblingData, { operation }) => {
          if (operation === 'create') return false
          return Boolean(siblingData?.student)
        },
        description:
          'This IEM number is locked. Card No. can only be assigned from the enrollment before approval.',
        readOnly: true,
      },
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', required: true },
        { name: 'lastName', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
      ],
    },
    {
      name: 'temporaryPassword',
      type: 'text',
      minLength: 8,
      label: 'Temporary password',
      admin: {
        autoComplete: 'new-password',
        condition: (_, __, { operation }) => operation === 'create',
        description:
          'Enter an initial login password for this student. The student will be asked to change it after first login. This value is used once and is not stored on the enrollment.',
        placeholder: 'Enter at least 8 characters',
      },
      access: {
        create: ({ req }) => isAdminRole(getRole(req.user)),
        read: ({ req }) => isAdminRole(getRole(req.user)),
        update: () => false,
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', required: true },
        {
          name: 'gradeLevel',
          type: 'select',
          required: false,
          options: [...gradeOptions],
          index: true,
          admin: {
            readOnly: true,
            description: 'Automatically matched to the selected class.',
          },
        },
        { name: 'guardianName', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'guardianPhone', type: 'text' },
        {
          name: 'status',
          type: 'select',
          options: ['pending', 'approved', 'rejected', 'cancelled'],
          defaultValue: 'pending',
          required: true,
          index: true,
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.student || siblingData?.user),
            description: 'Website-submitted enrollments can be approved or rejected by admins.',
          },
        },
        {
          name: 'paymentStatus',
          type: 'select',
          options: [...paymentStatusOptions],
          defaultValue: 'unpaid',
          required: true,
          index: true,
          label: 'Payment status',
        },
        {
          name: 'approvedBy',
          type: 'relationship',
          relationTo: 'users',
          filterOptions: {
            role: {
              in: ['super_admin', 'admin'],
            },
          },
          admin: {
            description: 'Automatically set to the administrator who approves this enrollment.',
            readOnly: true,
          },
        },
      ],
    },
    { name: 'message', type: 'textarea' },
    { name: 'adminNote', type: 'textarea' },
    {
      name: 'approvedAt',
      type: 'date',
      admin: { readOnly: true },
    },
  ],
  hooks: {
    afterRead: [
      ({ doc }) => {
        if (doc?.cardNumber) {
          ;(doc as { cardNumberLocked?: unknown }).cardNumberLocked = doc.cardNumber
        }
        return doc
      },
    ],
    beforeValidate: [
      async ({ data, operation, originalDoc, req }) => {
        if (!data) return data

        if (data.firstName !== undefined) data.firstName = normalizeEnrollmentText(data.firstName, 80)
        if (data.lastName !== undefined) data.lastName = normalizeEnrollmentText(data.lastName, 80)
        if (data.email !== undefined) data.email = normalizeEnrollmentEmail(data.email)
        if (data.phone !== undefined) data.phone = normalizeEnrollmentPhone(data.phone)
        if (data.guardianName !== undefined) data.guardianName = normalizeEnrollmentText(data.guardianName, 120)
        if (data.guardianPhone !== undefined) data.guardianPhone = normalizeEnrollmentPhone(data.guardianPhone)

        const isAdminCreated = isAdminRole(getRole(req.user))

        if (operation === 'create' && isAdminCreated) {
          data.status = 'approved'
        }

        // 1. Resolve gradeLevel first so it is available for student record creation
        const classRelation = data.class ?? originalDoc?.class
        let classID: string | number | undefined

        if (classRelation) {
          classID = getRelationID(classRelation)
          const classDoc = await req.payload.findByID({
            collection: 'classes',
            id: classID!,
            depth: 0,
            overrideAccess: true,
          }).catch(() => null)
          
          if (classDoc?.category) {
            data.gradeLevel =
              classCategoryToGrade[classDoc.category as keyof typeof classCategoryToGrade]
          }
        }

        // 2. For manual admin creation, validate the fields needed to create the account.
        // The actual user/student creation happens in beforeChange because Payload admin
        // also runs beforeValidate for form-state checks.
        if (operation === 'create' && (!data.student || !data.user)) {
          const email = normalizeEnrollmentEmail(data.email)
          const firstName = normalizeEnrollmentText(data.firstName, 80)
          const lastName = normalizeEnrollmentText(data.lastName, 80)
          const phone = normalizeEnrollmentPhone(data.phone)
          const temporaryPassword = normalizeTemporaryPassword(
            (data as { temporaryPassword?: unknown }).temporaryPassword,
          )

          if (!email || !firstName || !lastName || !phone) {
            throw new APIError('First Name, Last Name, Email, and Phone are required to create a new student.', 400, null, true)
          }

          if (!isAdminCreated) {
            throw new APIError(
              'A student and user account are required unless an administrator is creating this enrollment.',
              400,
              null,
              true,
            )
          }

          if (temporaryPassword.length < 8) {
            throw new APIError(
              'Enter a temporary password of at least 8 characters in the Temporary password field before creating this enrollment.',
              400,
              null,
              true,
            )
          }
        }

        const firstName = String(data.firstName ?? originalDoc?.firstName ?? '').trim()
        const lastName = String(data.lastName ?? originalDoc?.lastName ?? '').trim()
        data.fullName = [firstName, lastName].filter(Boolean).join(' ')

        const status = data.status ?? originalDoc?.status
        let cardNumber = data.cardNumber ?? originalDoc?.cardNumber
        if (data.cardNumber !== undefined) {
          const normalized = data.cardNumber ? normalizeStudentId(String(data.cardNumber)) : null
          data.cardNumber = normalized
          cardNumber = normalized
        }

        // Once card number is assigned, it cannot be undone or changed
        const originalCard = originalDoc?.cardNumber
        if (originalCard && cardNumber !== originalCard) {
          throw new APIError('Card number cannot be changed once assigned.', 400, null, true)
        }

        if (status === 'approved' && !cardNumber) {
          throw new APIError(
            'Card No. / IEM No. is required before an enrollment can be approved.',
            400,
            null,
            true,
          )
        }

        if (cardNumber) {
          const studentId = getRelationID(data.student ?? originalDoc?.student)
          const existing = await req.payload.find({
            collection: 'students',
            limit: 1,
            overrideAccess: true,
            where: {
              and: [
                { cardNumber: { equals: cardNumber } },
                studentId ? { id: { not_equals: studentId } } : {},
              ],
            },
          })
          if (existing.totalDocs > 0) {
            throw new APIError(
              `Card number ${formatStudentId(cardNumber)} is already assigned to another student.`,
              400,
              null,
              true,
            )
          }
        }

        // Validate that a student cannot enroll in multiple classes per year with same email/phone
        const email = data.email ?? originalDoc?.email
        const phone = data.phone ?? originalDoc?.phone
        const originalClassID = getRelationID(originalDoc?.class)
        const enrollmentKeyChanged =
          operation === 'create' ||
          String(email || '') !== String(originalDoc?.email || '') ||
          String(phone || '') !== String(originalDoc?.phone || '') ||
          String(status || '') !== String(originalDoc?.status || '') ||
          String(classID || '') !== String(originalClassID || '')

        if (!enrollmentKeyChanged || !['pending', 'approved'].includes(String(status))) {
          return data
        }

        if (email || phone) {
          const currentYear = new Date().getFullYear()
          const startOfYear = new Date(currentYear, 0, 1).toISOString()
          const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999).toISOString()

          const orConditions: Where[] = []
          if (email) orConditions.push({ email: { equals: email } })
          if (phone) orConditions.push({ phone: { equals: phone } })

          const whereQuery: Where & { and: Where[] } = {
            and: [
              {
                or: orConditions,
              },
              {
                createdAt: {
                  greater_than_equal: startOfYear,
                },
              },
              {
                createdAt: {
                  less_than_equal: endOfYear,
                },
              },
              {
                status: {
                  in: ['pending', 'approved'],
                },
              },
            ],
          }

          if (originalDoc?.id) {
            whereQuery.and.push({
              id: {
                not_equals: originalDoc.id,
              },
            })
          }

          const existingEnrollments = await req.payload.find({
            collection: 'enrollments',
            where: whereQuery,
            depth: 0,
            limit: 1,
            overrideAccess: true,
          })

          if (existingEnrollments.docs.length > 0) {
            const existing = existingEnrollments.docs[0]
            const existingClassID = getRelationID(existing.class)

            if (classID && existingClassID !== classID) {
              throw new APIError(
                'A student with this email address or phone number is already enrolled in a different class for the current year. Students can only enroll in one class per year.',
                400,
                null,
                true,
              )
            } else {
              throw new APIError(
                'A student with this email address or phone number is already enrolled in this class.',
                400,
                null,
                true,
              )
            }
          }
        }

        return data
      },
    ],
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        const isAdminCreated = isAdminRole(getRole(req.user))

        if (operation === 'create' && isAdminCreated && (!data.student || !data.user)) {
          const email = normalizeEnrollmentEmail(data.email)
          const firstName = normalizeEnrollmentText(data.firstName, 80)
          const lastName = normalizeEnrollmentText(data.lastName, 80)
          const phone = normalizeEnrollmentPhone(data.phone)
          const temporaryPassword = normalizeTemporaryPassword(
            (data as { temporaryPassword?: unknown }).temporaryPassword,
          )

          const [usersByEmail, usersByPhone, studentsByEmail, studentsByPhone] = await Promise.all([
            req.payload.find({
              collection: 'users',
              limit: 1,
              overrideAccess: true,
              where: { email: { equals: email } },
            }),
            req.payload.find({
              collection: 'users',
              limit: 1,
              overrideAccess: true,
              where: { phone: { equals: phone } },
            }),
            req.payload.find({
              collection: 'students',
              limit: 1,
              overrideAccess: true,
              where: { email: { equals: email } },
            }),
            req.payload.find({
              collection: 'students',
              limit: 1,
              overrideAccess: true,
              where: { phone: { equals: phone } },
            }),
          ])

          const emailUser = usersByEmail.docs[0]
          const phoneUser = usersByPhone.docs[0]
          const emailStudent = studentsByEmail.docs[0]
          const phoneStudent = studentsByPhone.docs[0]

          if (emailUser && phoneUser && emailUser.id !== phoneUser.id) {
            throw new APIError(
              'The email and phone number belong to different user accounts.',
              409,
              null,
              true,
            )
          }

          if (emailStudent && phoneStudent && emailStudent.id !== phoneStudent.id) {
            throw new APIError(
              'The email and phone number belong to different student records.',
              409,
              null,
              true,
            )
          }

          let userId = emailUser?.id ?? phoneUser?.id
          let studentId = emailStudent?.id ?? phoneStudent?.id

          if (userId && emailUser?.role && emailUser.role !== 'student') {
            throw new APIError('This email is already used by a non-student account.', 409, null, true)
          }

          if (userId && studentId) {
            const studentUserID = getRelationID((emailStudent ?? phoneStudent)?.user)
            if (studentUserID !== String(userId)) {
              throw new APIError(
                'The matching student record is linked to a different user account.',
                409,
                null,
                true,
              )
            }

            const existingEnrollment = await req.payload.find({
              collection: 'enrollments',
              depth: 0,
              limit: 1,
              overrideAccess: true,
              where: {
                or: [{ student: { equals: studentId } }, { user: { equals: userId } }],
              },
            })

            if (existingEnrollment.totalDocs > 0) {
              throw new APIError(
                'This student already has an enrollment. Open the existing student record instead of creating a new enrollment.',
                409,
                null,
                true,
              )
            }

            await req.payload.update({
              collection: 'users',
              id: userId,
              overrideAccess: true,
              req,
              data: {
                password: temporaryPassword,
                mustChangePassword: true,
                status: 'active',
              },
            })
          }

          if (userId && !studentId) {
            await req.payload.update({
              collection: 'users',
              id: userId,
              overrideAccess: true,
              req,
              data: {
                password: temporaryPassword,
                firstName,
                lastName,
                phone,
                role: 'student',
                status: 'active',
                mustChangePassword: true,
              },
            })
          }

          if (!userId) {
            const newUser = await req.payload.create({
              collection: 'users',
              overrideAccess: true,
              req,
              data: {
                email,
                password: temporaryPassword,
                firstName,
                lastName,
                phone,
                role: 'student',
                status: 'active',
                mustChangePassword: true,
              },
            })
            userId = newUser.id
          }

          if (!studentId) {
            const newStudent = await req.payload.create({
              collection: 'students',
              overrideAccess: true,
              req,
              data: {
                user: userId,
                firstName,
                lastName,
                email,
                phone,
                gradeLevel: data.gradeLevel || 'Grade 7',
                enrollmentStatus: data.status || 'pending',
                paymentStatus: data.paymentStatus || 'unpaid',
                cardNumber: data.cardNumber || undefined,
              },
            })
            studentId = newStudent.id
          }

          data.user = userId
          data.student = studentId
        }

        delete (data as { temporaryPassword?: unknown }).temporaryPassword

        if (
          data.status === 'approved' &&
          originalDoc?.status !== 'approved' &&
          req.user?.id
        ) {
          data.approvedBy = req.user.id
          data.approvedAt = new Date().toISOString()
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        const rawStudentID = getRelationID(doc.student)
        const rawClassID = getRelationID(doc.class)
        const studentID = typeof rawStudentID === 'number' ? rawStudentID : Number(rawStudentID)
        const classID = typeof rawClassID === 'number' ? rawClassID : Number(rawClassID)
        if (!Number.isFinite(studentID) || !Number.isFinite(classID)) return
        if (!studentID || !classID) return

        const student = await req.payload.findByID({
          collection: 'students',
          id: studentID,
          depth: 0,
          overrideAccess: true,
          req,
        })
        const existingClasses = (student.currentClasses || [])
          .map((item) => {
            const id = getRelationID(item)
            return typeof id === 'number' ? id : Number(id)
          })
          .filter((id) => Number.isFinite(id))
        const isApproved = doc.status === 'approved'
        const currentClasses = isApproved
          ? [...new Set([...existingClasses, classID])]
          : existingClasses.filter((id) => id !== classID)
        const enrollmentStatus =
          doc.status === 'cancelled' ? 'inactive' : doc.status

        await req.payload.update({
          collection: 'students',
          id: studentID,
          overrideAccess: true,
          req,
          data: {
            enrollmentStatus,
            gradeLevel: doc.gradeLevel,
            paymentStatus: doc.paymentStatus || 'unpaid',
            preferredClass: classID,
            currentClasses,
            // Sync the card number to the student
            cardNumber: doc.cardNumber || student.cardNumber || undefined,
          },
        })
      },
    ],
  },
  timestamps: true,
}

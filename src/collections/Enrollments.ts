import type { CollectionConfig } from 'payload'

import { admins, getRole, isAdminRole } from '@/access/roles'
import { gradeOptions } from '@/fields/gradeOptions'
import { paymentStatusOptions } from '@/fields/paymentStatusOptions'

const classCategoryToGrade = {
  grade_6: 'Grade 6',
  grade_7: 'Grade 7',
  grade_8: 'Grade 8',
  grade_9: 'Grade 9',
  grade_10: 'Grade 10',
  grade_11: 'Grade 11',
} as const

const getRelationID = (value: unknown) => {
  if (value && typeof value === 'object' && 'id' in value) {
    return String(value.id)
  }

  return value === undefined || value === null ? undefined : String(value)
}

export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  labels: {
    singular: 'Enrollment',
    plural: 'Enrollments',
  },
  admin: {
    group: 'Institute',
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'class', 'phone', 'status', 'paymentStatus', 'createdAt'],
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
        { name: 'student', type: 'relationship', relationTo: 'students', required: true },
        { name: 'user', type: 'relationship', relationTo: 'users', required: true },
        { name: 'class', type: 'relationship', relationTo: 'classes', required: true },
      ],
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
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', required: true },
        {
          name: 'gradeLevel',
          type: 'select',
          required: true,
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
    beforeValidate: [
      async ({ data, operation, originalDoc, req }) => {
        if (!data) return data
        const firstName = String(data.firstName ?? originalDoc?.firstName ?? '').trim()
        const lastName = String(data.lastName ?? originalDoc?.lastName ?? '').trim()
        data.fullName = [firstName, lastName].filter(Boolean).join(' ')

        const classRelation = data.class ?? originalDoc?.class
        let classID: string | number | undefined

        if (classRelation) {
          classID = getRelationID(classRelation)
          const classDoc = await req.payload.findByID({
            collection: 'classes',
            id: classID!,
            depth: 0,
          })
          data.gradeLevel =
            classCategoryToGrade[classDoc.category as keyof typeof classCategoryToGrade]
        }

        // Validate that a student cannot enroll in multiple classes per year with same email/phone
        const email = data.email ?? originalDoc?.email
        const phone = data.phone ?? originalDoc?.phone
        const status = data.status ?? originalDoc?.status
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

          const orConditions: any[] = []
          if (email) orConditions.push({ email: { equals: email } })
          if (phone) orConditions.push({ phone: { equals: phone } })

          const whereQuery: any = {
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
          })

          if (existingEnrollments.docs.length > 0) {
            const existing = existingEnrollments.docs[0]
            const existingClassID = getRelationID(existing.class)

            if (classID && existingClassID !== String(classID)) {
              throw new Error(
                'A student with this email address or phone number is already enrolled in a different class for the current year. Students can only enroll in one class per year.'
              )
            } else {
              throw new Error(
                'A student with this email address or phone number is already enrolled in this class.'
              )
            }
          }
        }

        return data
      },
    ],
    beforeChange: [
      ({ data, originalDoc, req }) => {
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
        const studentID = typeof doc.student === 'object' ? doc.student.id : doc.student
        const classID = typeof doc.class === 'object' ? doc.class.id : doc.class
        if (!studentID || !classID) return

        const student = await req.payload.findByID({
          collection: 'students',
          id: studentID,
          depth: 0,
          overrideAccess: true,
        })
        const existingClasses = (student.currentClasses || []).map((item) =>
          typeof item === 'object' ? item.id : item,
        )
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
          data: {
            enrollmentStatus,
            gradeLevel: doc.gradeLevel,
            paymentStatus: doc.paymentStatus || 'unpaid',
            preferredClass: classID,
            currentClasses,
          },
        })
      },
    ],
  },
  timestamps: true,
}

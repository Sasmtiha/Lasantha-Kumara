import { APIError, type CollectionConfig } from 'payload'

import { admins, isAdminRole, getRole } from '@/access/roles'
import { teacherClassWhere } from '@/access/teacherScope'
import { gradeOptions } from '@/fields/gradeOptions'
import { paymentStatusOptions } from '@/fields/paymentStatusOptions'
import { formatStudentId, normalizeStudentId } from '@/utilities/studentCardNumber'



export const Students: CollectionConfig = {
  slug: 'students',
  labels: {
    singular: 'Student',
    plural: 'Students',
  },
  admin: {
    group: 'Institute',
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'cardNumber', 'phone', 'gradeLevel', 'paymentStatus', 'preferredClass', 'enrollmentStatus'],
    components: {
      edit: {
        beforeDocumentControls: ['@/components/StudentDocumentControls#StudentDocumentControls'],
      },
    },

  },
  access: {
    create: () => false,
    delete: admins,
    read: async ({ req }) => {
      if (isAdminRole(getRole(req.user))) return true
      if (getRole(req.user) === 'teacher') {
        return teacherClassWhere(req, 'currentClasses')
      }
      if (!req.user?.id) return false
      return { user: { equals: req.user.id } }
    },
    update: ({ req }) => {
      if (isAdminRole(getRole(req.user))) return true
      if (!req.user?.id) return false
      return { user: { equals: req.user.id } }
    },
  },
  fields: [
    {
      name: 'fullName',
      type: 'text',
      index: true,
      admin: { hidden: true },
    },
    {
      name: 'cardNumber',
      type: 'text',
      unique: true,
      index: true,
      label: 'Card No.',
      admin: {
        description:
          'Assigned from the enrollment record only. To set an IEM number, open the student enrollment.',
        readOnly: true,
        hidden: true,
        components: {
          Cell: '@/components/CardNumberCell#CardNumberCell',
        },
      },
      access: {
        create: () => false,
        update: () => false,
      },
    },
    {
      name: 'studentDashboard',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/StudentAdminDashboard#StudentAdminDashboard',
        },
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      admin: { hidden: true },
      access: {
        update: ({ req }) => isAdminRole(getRole(req.user)),
      },
    },
    {
      name: 'preferredClass',
      type: 'relationship',
      relationTo: 'classes',
      admin: { hidden: true },
      access: {
        update: ({ req }) => isAdminRole(getRole(req.user)),
      },
    },
    {
      name: 'enrollmentStatus',
      type: 'select',
      defaultValue: 'pending',
      required: true,
      options: ['pending', 'approved', 'rejected', 'inactive'],
      admin: { hidden: true },
      access: {
        update: ({ req }) => isAdminRole(getRole(req.user)),
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'unpaid',
      required: true,
      index: true,
      label: 'Payment status',
      options: [...paymentStatusOptions],
      admin: { hidden: true },
      access: {
        update: ({ req }) => isAdminRole(getRole(req.user)),
      },
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
      admin: { hidden: true },
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      admin: { hidden: true },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: { hidden: true },
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      admin: { hidden: true },
    },
    {
      name: 'gradeLevel',
      type: 'select',
      required: true,
      label: 'Grade',
      options: [...gradeOptions],
      index: true,
      admin: { hidden: true },
      access: {
        update: ({ req }) => isAdminRole(getRole(req.user)),
      },
    },
    {
      name: 'school',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'address',
      type: 'textarea',
      admin: { hidden: true },
    },
    {
      name: 'guardianName',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'guardianPhone',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'guardianEmail',
      type: 'email',
      admin: { hidden: true },
    },
    {
      name: 'currentClasses',
      type: 'relationship',
      relationTo: 'classes',
      hasMany: true,
      label: 'Current classes',
      admin: {
        hidden: true,
        description: 'Assign all active classes currently attended by this student.',
      },
      access: {
        update: ({ req }) => isAdminRole(getRole(req.user)),
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: { hidden: true },
      access: {
        read: ({ req }) => isAdminRole(getRole(req.user)),
        update: ({ req }) => isAdminRole(getRole(req.user)),
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        if (!data) return data
        const firstName = String(data.firstName ?? originalDoc?.firstName ?? '').trim()
        const lastName = String(data.lastName ?? originalDoc?.lastName ?? '').trim()
        data.fullName = [firstName, lastName].filter(Boolean).join(' ')

        // Normalize and validate cardNumber uniqueness with a clear error message
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

        if (
          cardNumber &&
          cardNumber !== originalDoc?.cardNumber
        ) {
          const existing = await req.payload.find({
            collection: 'students',
            limit: 1,
            overrideAccess: true,
            where: { cardNumber: { equals: cardNumber } },
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

        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        if (!req.context) req.context = {}
        if (req.context.deletingAssociated) return
        req.context.deletingAssociated = true

        // 1. Find the student record to get the associated user ID
        const student = await req.payload.findByID({
          collection: 'students',
          id,
          depth: 0,
          overrideAccess: true,
          req,
        })

        if (!student) return

        // 2. Delete associated Enrollment record(s)
        const enrollments = await req.payload.find({
          collection: 'enrollments',
          where: { student: { equals: id } },
          limit: 100,
          overrideAccess: true,
          req,
        })
        for (const doc of enrollments.docs) {
          await req.payload.delete({
            collection: 'enrollments',
            id: doc.id,
            overrideAccess: true,
            req,
          })
        }

        // 3. Delete associated PaymentSlip record(s)
        const paymentSlips = await req.payload.find({
          collection: 'payment-slips',
          where: { student: { equals: id } },
          limit: 100,
          overrideAccess: true,
          req,
        })
        for (const doc of paymentSlips.docs) {
          await req.payload.delete({
            collection: 'payment-slips',
            id: doc.id,
            overrideAccess: true,
            req,
          })
        }

        // 4. Delete associated StudentMark record(s)
        const studentMarks = await req.payload.find({
          collection: 'student-marks',
          where: { student: { equals: id } },
          limit: 100,
          overrideAccess: true,
          req,
        })
        for (const doc of studentMarks.docs) {
          await req.payload.delete({
            collection: 'student-marks',
            id: doc.id,
            overrideAccess: true,
            req,
          })
        }

        // 5. Delete associated User record
        const userId = typeof student.user === 'object' ? student.user?.id : student.user
        if (userId) {
          try {
            await req.payload.delete({
              collection: 'users',
              id: userId,
              overrideAccess: true,
              req,
            })
          } catch (err) {
            // Ignore error if already deleted
          }
        }
      },
    ],
  },

  timestamps: true,
}

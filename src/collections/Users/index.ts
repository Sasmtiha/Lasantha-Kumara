import { APIError, type CollectionConfig } from 'payload'

import {
  adminFieldAccess,
  admins,
  adminsOrSelf,
  getRole,
  instituteRoles,
  isActiveUser,
} from '../../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req }) => ['super_admin', 'admin', 'teacher'].includes(getRole(req.user) || ''),
    create: admins,
    delete: admins,
    read: adminsOrSelf,
    update: adminsOrSelf,
  },
  admin: {
    group: 'Institute',
    defaultColumns: ['firstName', 'lastName', 'email', 'role', 'status'],
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', required: true, defaultValue: 'Institute' },
        { name: 'lastName', type: 'text', required: true, defaultValue: 'User' },
        {
          name: 'phone',
          type: 'text',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'role',
          type: 'select',
          options: instituteRoles.map((role) => ({
            label: role.replace('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
            value: role,
          })),
          defaultValue: 'student',
          required: true,
          saveToJWT: true,
          access: {
            update: adminFieldAccess,
          },
        },
        {
          name: 'status',
          type: 'select',
          options: ['active', 'inactive', 'suspended'],
          defaultValue: 'active',
          required: true,
          saveToJWT: true,
          access: {
            update: adminFieldAccess,
          },
        },
      ],
    },
    {
      name: 'mustChangePassword',
      type: 'checkbox',
      defaultValue: false,
      label: 'Require password change',
      saveToJWT: true,
      admin: {
        description:
          'Use this for accounts created by an administrator with a temporary password.',
      },
      access: {
        update: adminFieldAccess,
      },
    },
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
    },
  ],
  hooks: {
    beforeLogin: [
      ({ user }) => {
        if (!isActiveUser(user)) {
          throw new APIError('This account is not active.', 403, null, true)
        }

        return user
      },
    ],
    beforeValidate: [
      ({ data }) => {
        if (data?.firstName || data?.lastName) {
          data.name = [data.firstName, data.lastName].filter(Boolean).join(' ')
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        if (!req.context) req.context = {}
        if (req.context.deletingAssociated) return
        req.context.deletingAssociated = true

        // 1. Delete associated Student record(s)
        const students = await req.payload.find({
          collection: 'students',
          where: { user: { equals: id } },
          limit: 100,
          overrideAccess: true,
          req,
        })
        for (const doc of students.docs) {
          await req.payload.delete({
            collection: 'students',
            id: doc.id,
            overrideAccess: true,
            req,
          })
        }

        // 2. Delete associated Enrollment record(s)
        const enrollments = await req.payload.find({
          collection: 'enrollments',
          where: { user: { equals: id } },
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

        // 3. Delete associated Teacher record(s)
        const teachers = await req.payload.find({
          collection: 'teachers',
          where: { user: { equals: id } },
          limit: 100,
          overrideAccess: true,
          req,
        })
        for (const doc of teachers.docs) {
          await req.payload.delete({
            collection: 'teachers',
            id: doc.id,
            overrideAccess: true,
            req,
          })
        }

        // 4. Delete associated PaymentSlip record(s)
        const paymentSlips = await req.payload.find({
          collection: 'payment-slips',
          where: { user: { equals: id } },
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

        // 5. Delete associated StudentMark record(s)
        const studentMarks = await req.payload.find({
          collection: 'student-marks',
          where: { user: { equals: id } },
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
      },
    ],
  },
  timestamps: true,
}

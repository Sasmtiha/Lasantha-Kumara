import type { CollectionConfig } from 'payload'

import { admins, getRole, isAdminRole } from '@/access/roles'

export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  labels: {
    singular: 'Enrollment',
    plural: 'Enrollments',
  },
  admin: {
    group: 'Institute',
    useAsTitle: 'firstName',
    defaultColumns: ['firstName', 'lastName', 'class', 'phone', 'status', 'createdAt'],
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
    { name: 'student', type: 'relationship', relationTo: 'students', required: true },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'class', type: 'relationship', relationTo: 'classes', required: true },
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', required: true },
        { name: 'lastName', type: 'text', required: true },
      ],
    },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'gradeLevel', type: 'text', required: true },
    { name: 'guardianName', type: 'text' },
    { name: 'guardianPhone', type: 'text' },
    { name: 'message', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'approved', 'rejected', 'cancelled'],
      defaultValue: 'pending',
      required: true,
      index: true,
    },
    { name: 'adminNote', type: 'textarea' },
    { name: 'approvedBy', type: 'relationship', relationTo: 'users' },
    { name: 'approvedAt', type: 'date' },
  ],
  hooks: {
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
  },
  timestamps: true,
}

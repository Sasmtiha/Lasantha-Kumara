import type { CollectionConfig } from 'payload'

import { admins, getRole, isAdminRole } from '@/access/roles'

export const Teachers: CollectionConfig = {
  slug: 'teachers',
  labels: {
    singular: 'Teacher',
    plural: 'Teachers',
  },
  admin: {
    group: 'Institute',
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'email', 'phone', 'isActive'],
  },
  access: {
    create: admins,
    delete: admins,
    read: ({ req }) => isAdminRole(getRole(req.user)) || { isActive: { equals: true } },
    update: admins,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'user', type: 'relationship', relationTo: 'users' },
        { name: 'fullName', type: 'text', required: true },
        { name: 'phone', type: 'text' },
      ],
    },
    { name: 'bio', type: 'richText' },
    { name: 'qualifications', type: 'textarea' },
    { name: 'profileImage', type: 'upload', relationTo: 'media' },
    {
      name: 'classesHandled',
      label: 'Classes handled',
      type: 'relationship',
      relationTo: 'classes',
      hasMany: true,
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email' },
        { name: 'isActive', type: 'checkbox', defaultValue: true },
      ],
    },
  ],
  timestamps: true,
}

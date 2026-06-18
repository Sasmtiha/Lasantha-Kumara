import type { CollectionConfig } from 'payload'

import { admins, isAdminRole, getRole } from '@/access/roles'

export const Students: CollectionConfig = {
  slug: 'students',
  labels: {
    singular: 'Student',
    plural: 'Students',
  },
  admin: {
    group: 'Institute',
    useAsTitle: 'firstName',
    defaultColumns: ['firstName', 'lastName', 'phone', 'gradeLevel', 'preferredClass', 'enrollmentStatus'],
  },
  access: {
    create: admins,
    delete: admins,
    read: ({ req }) => {
      if (isAdminRole(getRole(req.user))) return true
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
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      access: {
        update: ({ req }) => isAdminRole(getRole(req.user)),
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', required: true },
        { name: 'lastName', type: 'text', required: true },
      ],
    },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'gradeLevel', type: 'text', required: true, label: 'Grade / Level' },
    { name: 'school', type: 'text' },
    { name: 'address', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'guardianName', type: 'text' },
        { name: 'guardianPhone', type: 'text' },
        { name: 'guardianEmail', type: 'email' },
      ],
    },
    {
      name: 'preferredClass',
      type: 'relationship',
      relationTo: 'classes',
    },
    {
      name: 'enrollmentStatus',
      type: 'select',
      defaultValue: 'pending',
      required: true,
      options: ['pending', 'approved', 'rejected', 'inactive'],
      access: {
        update: ({ req }) => isAdminRole(getRole(req.user)),
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      access: {
        read: ({ req }) => isAdminRole(getRole(req.user)),
        update: ({ req }) => isAdminRole(getRole(req.user)),
      },
    },
  ],
  timestamps: true,
}

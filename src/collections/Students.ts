import type { CollectionConfig } from 'payload'

import { admins, isAdminRole, getRole } from '@/access/roles'
import { gradeOptions } from '@/fields/gradeOptions'

export const Students: CollectionConfig = {
  slug: 'students',
  labels: {
    singular: 'Student',
    plural: 'Students',
  },
  admin: {
    group: 'Institute',
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'phone', 'gradeLevel', 'preferredClass', 'enrollmentStatus'],
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
      name: 'fullName',
      type: 'text',
      index: true,
      admin: { hidden: true },
    },
    {
      type: 'row',
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
          label: 'Grade',
          options: [...gradeOptions],
          index: true,
        },
        { name: 'school', type: 'text' },
      ],
    },
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
      name: 'currentClasses',
      type: 'relationship',
      relationTo: 'classes',
      hasMany: true,
      label: 'Current classes',
      admin: {
        description: 'Assign all active classes currently attended by this student.',
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
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        if (!data) return data
        const firstName = String(data.firstName ?? originalDoc?.firstName ?? '').trim()
        const lastName = String(data.lastName ?? originalDoc?.lastName ?? '').trim()
        data.fullName = [firstName, lastName].filter(Boolean).join(' ')
        return data
      },
    ],
  },
  timestamps: true,
}

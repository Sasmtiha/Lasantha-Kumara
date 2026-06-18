import type { CollectionConfig } from 'payload'

import { adminFieldAccess, admins, adminsOrSelf, getRole, instituteRoles } from '../../access/roles'

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
      ],
    },
    {
      name: 'phone',
      type: 'text',
    },
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
    {
      name: 'profileImage',
      type: 'upload',
      relationTo: 'media',
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.firstName || data?.lastName) {
          data.name = [data.firstName, data.lastName].filter(Boolean).join(' ')
        }
        return data
      },
    ],
  },
  timestamps: true,
}

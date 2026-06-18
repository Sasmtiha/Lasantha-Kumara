import type { CollectionConfig } from 'payload'

import { admins, getRole, isAdminRole } from '@/access/roles'

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: {
    singular: 'Contact Message',
    plural: 'Contact Messages',
  },
  admin: {
    group: 'Institute',
    useAsTitle: 'subject',
    defaultColumns: ['firstName', 'lastName', 'subject', 'email', 'status', 'createdAt'],
  },
  access: {
    create: () => true,
    delete: admins,
    read: admins,
    update: admins,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', required: true },
        { name: 'lastName', type: 'text', required: true },
      ],
    },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'subject', type: 'text', required: true },
    { name: 'message', type: 'textarea', required: true },
    { name: 'preferredClass', type: 'relationship', relationTo: 'classes' },
    {
      name: 'status',
      type: 'select',
      options: ['new', 'read', 'replied', 'archived'],
      defaultValue: 'new',
      required: true,
      access: {
        create: ({ req }) => isAdminRole(getRole(req.user)),
        update: ({ req }) => isAdminRole(getRole(req.user)),
      },
    },
  ],
  timestamps: true,
}

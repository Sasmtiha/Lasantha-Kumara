import type { CollectionConfig } from 'payload'

import { admins, getRole, isAdminRole } from '@/access/roles'

export const Schedules: CollectionConfig = {
  slug: 'schedules',
  labels: {
    singular: 'Class Schedule',
    plural: 'Class Schedule',
  },
  admin: {
    group: 'Academics',
    useAsTitle: 'batchLabel',
    defaultColumns: ['class', 'dayOfWeek', 'startTime', 'endTime', 'mode', 'isActive'],
  },
  access: {
    create: admins,
    delete: admins,
    read: ({ req }) => isAdminRole(getRole(req.user)) || { isActive: { equals: true } },
    update: admins,
  },
  defaultSort: 'displayOrder',
  fields: [
    { name: 'class', type: 'relationship', relationTo: 'classes', required: true },
    {
      name: 'dayOfWeek',
      type: 'select',
      required: true,
      options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    { name: 'batchLabel', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'startTime', type: 'text', required: true },
        { name: 'endTime', type: 'text', required: true },
      ],
    },
    { name: 'location', type: 'text', defaultValue: 'Middeniya' },
    {
      name: 'mode',
      type: 'select',
      options: ['physical', 'online', 'hybrid'],
      defaultValue: 'physical',
    },
    { name: 'isActive', type: 'checkbox', defaultValue: true, index: true },
    { name: 'displayOrder', type: 'number', defaultValue: 0, index: true },
  ],
  timestamps: true,
}

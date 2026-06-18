import type { CollectionConfig } from 'payload'

import { admins } from '@/access/roles'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  labels: {
    singular: 'Gallery Image',
    plural: 'Gallery',
  },
  admin: {
    group: 'Website',
    useAsTitle: 'titleEn',
    defaultColumns: ['titleEn', 'category', 'isPublished', 'displayOrder'],
  },
  access: {
    create: admins,
    delete: admins,
    read: () => true,
    update: admins,
  },
  defaultSort: 'displayOrder',
  fields: [
    { name: 'titleEn', type: 'text', required: true, label: 'Title (English)' },
    { name: 'titleSi', type: 'text', label: 'Title (සිංහල)' },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: ['Classes', 'Events', 'Student Life', 'Achievements'],
    },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'alt', type: 'text', required: true },
    { name: 'isPublished', type: 'checkbox', defaultValue: true, index: true },
    { name: 'displayOrder', type: 'number', defaultValue: 0 },
  ],
  timestamps: true,
}

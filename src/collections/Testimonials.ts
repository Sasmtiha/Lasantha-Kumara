import type { CollectionConfig } from 'payload'

import { admins } from '@/access/roles'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: {
    singular: 'Testimonial',
    plural: 'Testimonials',
  },
  admin: {
    group: 'Website',
    useAsTitle: 'name',
    defaultColumns: ['name', 'studentType', 'rating', 'isFeatured', 'displayOrder'],
  },
  access: {
    create: admins,
    delete: admins,
    read: () => true,
    update: admins,
  },
  defaultSort: 'displayOrder',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'studentType', type: 'text', required: true },
        { name: 'rating', type: 'number', min: 1, max: 5, defaultValue: 5, required: true },
      ],
    },
    { name: 'feedbackEn', type: 'textarea', required: true, label: 'Feedback (English)' },
    { name: 'feedbackSi', type: 'textarea', label: 'Feedback (සිංහල)' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        { name: 'isFeatured', type: 'checkbox', defaultValue: false, index: true },
        { name: 'displayOrder', type: 'number', defaultValue: 0 },
      ],
    },
  ],
  timestamps: true,
}

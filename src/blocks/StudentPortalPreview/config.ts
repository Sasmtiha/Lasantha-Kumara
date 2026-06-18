import type { Block } from 'payload'

export const StudentPortalPreview: Block = {
  slug: 'studentPortalPreview',
  interfaceName: 'StudentPortalPreviewBlock',
  fields: [
    { name: 'headingEn', type: 'text', required: true },
    { name: 'headingSi', type: 'text' },
    { name: 'descriptionEn', type: 'textarea', required: true },
    { name: 'descriptionSi', type: 'textarea' },
    { name: 'buttonLabel', type: 'text', defaultValue: 'Open Student Portal' },
    { name: 'buttonUrl', type: 'text', defaultValue: '/login' },
    {
      name: 'features',
      type: 'array',
      minRows: 3,
      maxRows: 8,
      fields: [
        { name: 'titleEn', type: 'text', required: true },
        { name: 'titleSi', type: 'text' },
        {
          name: 'icon',
          type: 'select',
          options: ['classes', 'schedule', 'resources', 'notices', 'status', 'support'],
          defaultValue: 'classes',
        },
      ],
    },
  ],
}

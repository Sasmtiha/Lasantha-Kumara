import type { Block } from 'payload'

export const FeaturedProgram: Block = {
  slug: 'featuredProgram',
  interfaceName: 'FeaturedProgramBlock',
  fields: [
    { name: 'eyebrowEn', type: 'text', defaultValue: 'IEM.lk Special' },
    { name: 'eyebrowSi', type: 'text' },
    { name: 'headingEn', type: 'text', required: true },
    { name: 'headingSi', type: 'text' },
    { name: 'descriptionEn', type: 'textarea' },
    { name: 'descriptionSi', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'buttonLabel', type: 'text', defaultValue: 'Join Now' },
    { name: 'buttonUrl', type: 'text', defaultValue: '/enroll' },
    {
      name: 'features',
      type: 'array',
      required: true,
      minRows: 3,
      maxRows: 7,
      fields: [
        { name: 'titleEn', type: 'text', required: true },
        { name: 'titleSi', type: 'text' },
        { name: 'descriptionEn', type: 'textarea', required: true },
        { name: 'descriptionSi', type: 'textarea' },
        {
          name: 'icon',
          type: 'select',
          options: ['spoken', 'grammar', 'exam', 'writing', 'progress'],
          defaultValue: 'spoken',
        },
      ],
    },
  ],
}

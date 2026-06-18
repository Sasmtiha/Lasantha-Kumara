import type { Block } from 'payload'

export const WorkProcess: Block = {
  slug: 'workProcess',
  interfaceName: 'WorkProcessBlock',
  fields: [
    { name: 'headingEn', type: 'text', required: true },
    { name: 'headingSi', type: 'text' },
    { name: 'descriptionEn', type: 'textarea', required: true },
    { name: 'descriptionSi', type: 'textarea' },
    {
      name: 'steps',
      type: 'array',
      required: true,
      minRows: 3,
      maxRows: 7,
      fields: [
        { name: 'titleEn', type: 'text', required: true },
        { name: 'titleSi', type: 'text' },
        { name: 'descriptionEn', type: 'textarea', required: true },
        { name: 'descriptionSi', type: 'textarea' },
      ],
    },
  ],
}

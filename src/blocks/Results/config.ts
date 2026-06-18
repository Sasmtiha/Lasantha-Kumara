import type { Block } from 'payload'

export const Results: Block = {
  slug: 'results',
  interfaceName: 'ResultsBlock',
  fields: [
    { name: 'headingEn', type: 'text', required: true },
    { name: 'headingSi', type: 'text' },
    { name: 'descriptionEn', type: 'textarea', required: true },
    { name: 'descriptionSi', type: 'textarea' },
    { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
    { name: 'ctaLabel', type: 'text', defaultValue: 'Explore Classes' },
    { name: 'ctaUrl', type: 'text', defaultValue: '#classes' },
    {
      name: 'metrics',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'labelEn', type: 'text', required: true },
        { name: 'labelSi', type: 'text' },
      ],
    },
  ],
}

import type { Block } from 'payload'

export const Metrics: Block = {
  slug: 'metrics',
  interfaceName: 'MetricsBlock',
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 2,
      maxRows: 6,
      required: true,
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'labelEn', type: 'text', required: true },
        { name: 'labelSi', type: 'text' },
        {
          name: 'icon',
          type: 'select',
          options: ['experience', 'students', 'results', 'batch'],
          defaultValue: 'experience',
        },
      ],
    },
  ],
}

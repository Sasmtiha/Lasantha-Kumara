import type { Block } from 'payload'

export const FAQ: Block = {
  slug: 'faq',
  interfaceName: 'FAQBlock',
  fields: [
    { name: 'heading', type: 'text', required: true },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        { name: 'questionEn', type: 'text', required: true },
        { name: 'questionSi', type: 'text' },
        { name: 'answerEn', type: 'textarea', required: true },
        { name: 'answerSi', type: 'textarea' },
      ],
    },
  ],
}

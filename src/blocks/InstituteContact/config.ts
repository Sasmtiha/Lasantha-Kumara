import type { Block } from 'payload'

export const InstituteContact: Block = {
  slug: 'instituteContact',
  interfaceName: 'InstituteContactBlock',
  fields: [
    { name: 'headingEn', type: 'text', required: true },
    { name: 'headingSi', type: 'text' },
    { name: 'descriptionEn', type: 'textarea' },
    { name: 'descriptionSi', type: 'textarea' },
    { name: 'showContactForm', type: 'checkbox', defaultValue: true },
    { name: 'showContactDetails', type: 'checkbox', defaultValue: true },
  ],
}

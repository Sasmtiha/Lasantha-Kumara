import type { Block } from 'payload'

export const EnrollmentCTA: Block = {
  slug: 'enrollmentCTA',
  interfaceName: 'EnrollmentCTABlock',
  fields: [
    { name: 'headingEn', type: 'text', required: true },
    { name: 'headingSi', type: 'text' },
    { name: 'descriptionEn', type: 'textarea', required: true },
    { name: 'descriptionSi', type: 'textarea' },
    { name: 'buttonLabel', type: 'text', required: true },
    { name: 'buttonUrl', type: 'text', required: true },
    { name: 'backgroundStyle', type: 'select', options: ['navy', 'gold', 'light'], defaultValue: 'gold' },
  ],
}

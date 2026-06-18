import type { Block } from 'payload'

export const AboutTeacher: Block = {
  slug: 'aboutTeacher',
  interfaceName: 'AboutTeacherBlock',
  fields: [
    { name: 'headingEn', type: 'text', required: true, label: 'Heading (English)' },
    { name: 'headingSi', type: 'text', label: 'Heading (සිංහල)' },
    { name: 'descriptionEn', type: 'richText', required: true, label: 'Description (English)' },
    { name: 'descriptionSi', type: 'richText', label: 'Description (සිංහල)' },
    { name: 'teacherImage', type: 'upload', relationTo: 'media' },
    {
      name: 'featureCards',
      type: 'array',
      fields: [
        { name: 'titleEn', type: 'text', required: true },
        { name: 'titleSi', type: 'text' },
        { name: 'descriptionEn', type: 'textarea' },
        { name: 'descriptionSi', type: 'textarea' },
        { name: 'icon', type: 'select', options: ['award', 'book', 'users', 'target'], defaultValue: 'award' },
      ],
    },
  ],
}

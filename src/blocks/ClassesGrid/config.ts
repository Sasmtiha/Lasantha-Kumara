import type { Block } from 'payload'

export const ClassesGrid: Block = {
  slug: 'classesGrid',
  interfaceName: 'ClassesGridBlock',
  fields: [
    { name: 'headingEn', type: 'text', required: true },
    { name: 'headingSi', type: 'text' },
    { name: 'subtitleEn', type: 'textarea' },
    { name: 'subtitleSi', type: 'textarea' },
    { name: 'selectedClasses', type: 'relationship', relationTo: 'classes', hasMany: true },
    { name: 'showAllClasses', type: 'checkbox', defaultValue: true },
  ],
}

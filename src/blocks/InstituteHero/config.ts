import type { Block } from 'payload'

export const InstituteHero: Block = {
  slug: 'instituteHero',
  interfaceName: 'InstituteHeroBlock',
  labels: {
    singular: 'Institute Hero',
    plural: 'Institute Heroes',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'English',
          fields: [
            { name: 'badgeEn', type: 'text', required: true, label: 'Badge' },
            { name: 'headingEn', type: 'text', required: true, label: 'Heading' },
            { name: 'subheadingEn', type: 'textarea', required: true, label: 'Subheading' },
          ],
        },
        {
          label: 'සිංහල',
          fields: [
            { name: 'badgeSi', type: 'text', label: 'Badge' },
            { name: 'headingSi', type: 'text', label: 'Heading' },
            { name: 'subheadingSi', type: 'textarea', label: 'Subheading' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'primaryButtonLabel', type: 'text', required: true },
        { name: 'primaryButtonUrl', type: 'text', required: true },
        { name: 'secondaryButtonLabel', type: 'text' },
        { name: 'secondaryButtonUrl', type: 'text' },
      ],
    },
    { name: 'heroImage', type: 'upload', relationTo: 'media' },
    {
      name: 'metrics',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'labelEn', type: 'text', required: true, label: 'Label (English)' },
        { name: 'labelSi', type: 'text', label: 'Label (සිංහල)' },
      ],
    },
  ],
}

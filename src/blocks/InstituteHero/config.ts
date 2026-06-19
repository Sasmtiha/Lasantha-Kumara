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
    {
      name: 'heroSlides',
      type: 'array',
      label: 'Hero background slideshow',
      maxRows: 6,
      admin: {
        description:
          'Add 2–6 landscape images. They will change automatically with a smooth crossfade.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'slideDuration',
      type: 'number',
      label: 'Seconds per image',
      defaultValue: 7,
      min: 4,
      max: 15,
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Fallback background image',
      admin: {
        description: 'Used when no slideshow images have been added.',
      },
    },
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

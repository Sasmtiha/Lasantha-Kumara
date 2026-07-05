import type { Block } from 'payload'

export const AboutUs: Block = {
  slug: 'aboutUs',
  interfaceName: 'AboutUsBlock',
  labels: {
    singular: 'About Us',
    plural: 'About Us Sections',
  },
  fields: [
    { name: 'headingEn', type: 'text', required: true, label: 'Heading (English)' },
    { name: 'headingSi', type: 'text', label: 'Heading (සිංහල)' },
    { name: 'descriptionEn', type: 'richText', required: true, label: 'Description (English)' },
    { name: 'descriptionSi', type: 'richText', label: 'Description (සිංහල)' },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'About IEM image',
      admin: {
        description: 'The image shown in the About Us section near the top of the homepage.',
      },
    },
    { name: 'buttonLabel', type: 'text', defaultValue: 'Learn More' },
    { name: 'buttonUrl', type: 'text', defaultValue: '/about' },
  ],
}

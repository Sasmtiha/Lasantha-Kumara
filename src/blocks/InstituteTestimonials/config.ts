import type { Block } from 'payload'

export const InstituteTestimonials: Block = {
  slug: 'instituteTestimonials',
  interfaceName: 'InstituteTestimonialsBlock',
  fields: [
    { name: 'headingEn', type: 'text', required: true },
    { name: 'headingSi', type: 'text' },
    { name: 'subtitleEn', type: 'textarea' },
    { name: 'subtitleSi', type: 'textarea' },
    { name: 'selectedTestimonials', type: 'relationship', relationTo: 'testimonials', hasMany: true },
    { name: 'showFeaturedOnly', type: 'checkbox', defaultValue: true },
  ],
}

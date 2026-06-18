import type { Block } from 'payload'

export const GalleryBlock: Block = {
  slug: 'galleryBlock',
  interfaceName: 'GalleryBlock',
  fields: [
    { name: 'headingEn', type: 'text', required: true },
    { name: 'headingSi', type: 'text' },
    { name: 'descriptionEn', type: 'textarea' },
    { name: 'descriptionSi', type: 'textarea' },
    { name: 'selectedImages', type: 'relationship', relationTo: 'gallery', hasMany: true },
    { name: 'showAll', type: 'checkbox', defaultValue: true },
  ],
}

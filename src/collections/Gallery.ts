import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

import { admins } from '@/access/roles'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const titleFromFilename = (value?: string) =>
  value
    ?.replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim() || 'Gallery Photo'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  labels: {
    singular: 'Gallery Image',
    plural: 'Gallery',
  },
  admin: {
    group: 'Website',
    useAsTitle: 'titleEn',
    defaultColumns: ['titleEn', 'category', 'isPublished', 'displayOrder'],
  },
  access: {
    create: admins,
    delete: admins,
    read: () => true,
    update: admins,
  },
  defaultSort: 'displayOrder',
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (!data) return data

        const generatedTitle = titleFromFilename(req.file?.name)
        data.titleEn ||= generatedTitle
        data.alt ||= data.titleEn
        data.category ||= 'Classes'

        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'titleEn', type: 'text', required: true, label: 'Title (English)' },
        { name: 'titleSi', type: 'text', label: 'Title (සිංහල)' },
        {
          name: 'category',
          type: 'select',
          required: true,
          defaultValue: 'Classes',
          options: ['Classes', 'Events', 'Student Life', 'Achievements'],
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { hidden: true },
    },
    {
      type: 'row',
      fields: [
        { name: 'alt', type: 'text', required: true },
        { name: 'displayOrder', type: 'number', defaultValue: 0 },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'isPublished',
          type: 'checkbox',
          defaultValue: true,
          index: true,
          admin: {
            className: 'gallery-publish-field',
          },
        },
      ],
    },
  ],
  upload: {
    adminThumbnail: 'thumbnail',
    bulkUpload: true,
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 300 },
      { name: 'medium', width: 900 },
      { name: 'large', width: 1400 },
      { name: 'xlarge', width: 1920 },
    ],
    mimeTypes: ['image/*'],
    staticDir: path.resolve(dirname, '../../public/gallery'),
  },
  timestamps: true,
}

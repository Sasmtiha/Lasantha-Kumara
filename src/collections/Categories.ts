import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { admins } from '../access/roles'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: admins,
    delete: admins,
    read: anyone,
    update: admins,
  },
  admin: {
    group: 'Website',
    hidden: true,
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}

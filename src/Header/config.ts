import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 8,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'primaryCTA',
      label: 'Primary call to action',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', defaultValue: 'Enroll Now' },
        { name: 'url', type: 'text', defaultValue: '/enroll' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'showLanguageToggle', type: 'checkbox', defaultValue: true },
        { name: 'showLoginLink', type: 'checkbox', defaultValue: true },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}

import type { GlobalConfig } from 'payload'

import { admins } from '@/access/roles'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Website',
  },
  access: {
    read: () => true,
    update: admins,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            { name: 'instituteNameEn', type: 'text', required: true, label: 'Institute name (English)' },
            { name: 'instituteNameSi', type: 'text', required: true, label: 'Institute name (සිංහල)' },
            { name: 'logo', type: 'upload', relationTo: 'media' },
            { name: 'missionEn', type: 'textarea', label: 'Mission (English)' },
            { name: 'missionSi', type: 'textarea', label: 'Mission (සිංහල)' },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'phone', type: 'text', required: true },
                { name: 'secondaryPhone', type: 'text', label: 'Secondary phone' },
                { name: 'whatsappNumber', type: 'text' },
                { name: 'email', type: 'email', required: true },
              ],
            },
            { name: 'addressEn', type: 'textarea', label: 'Address (English)' },
            { name: 'addressSi', type: 'textarea', label: 'Address (සිංහල)' },
            { name: 'officeHoursEn', type: 'text', label: 'Office hours (English)' },
            { name: 'officeHoursSi', type: 'text', label: 'Office hours (සිංහල)' },
          ],
        },
        {
          label: 'Social',
          fields: [
            { name: 'facebookUrl', type: 'text' },
            { name: 'instagramUrl', type: 'text' },
            { name: 'youtubeUrl', type: 'text' },
          ],
        },
      ],
    },
  ],
}

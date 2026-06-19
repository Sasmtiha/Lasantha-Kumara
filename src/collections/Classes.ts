import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { admins, getRole, isAdminRole } from '@/access/roles'

export const Classes: CollectionConfig = {
  slug: 'classes',
  labels: {
    singular: 'Class',
    plural: 'Classes',
  },
  admin: {
    group: 'Academics',
    useAsTitle: 'titleEn',
    defaultColumns: ['titleEn', 'category', 'level', 'teacher', 'isActive'],
  },
  access: {
    create: admins,
    delete: admins,
    read: ({ req }) => isAdminRole(getRole(req.user)) || { isActive: { equals: true } },
    update: admins,
  },
  defaultSort: 'displayOrder',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'English',
          fields: [
            { name: 'titleEn', type: 'text', required: true, label: 'Title' },
            { name: 'shortDescriptionEn', type: 'textarea', required: true, label: 'Short description' },
            { name: 'fullDescriptionEn', type: 'richText', label: 'Full description' },
          ],
        },
        {
          label: 'සිංහල',
          fields: [
            { name: 'titleSi', type: 'text', required: true, label: 'මාතෘකාව' },
            { name: 'shortDescriptionSi', type: 'textarea', label: 'කෙටි විස්තරය' },
            { name: 'fullDescriptionSi', type: 'richText', label: 'සම්පූර්ණ විස්තරය' },
          ],
        },
      ],
    },
    slugField({ fieldToUse: 'titleEn' }),
    {
      type: 'row',
      fields: [
        { name: 'durationPerWeek', type: 'text', defaultValue: '2 hours' },
        { name: 'maxStudents', type: 'number', min: 1 },
      ],
    },
    {
      name: 'level',
      type: 'select',
      required: true,
      options: ['beginner', 'intermediate', 'exam'],
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Grade 6', value: 'grade_6' },
        { label: 'Grade 7', value: 'grade_7' },
        { label: 'Grade 8', value: 'grade_8' },
        { label: 'Grade 9', value: 'grade_9' },
        { label: 'Grade 10', value: 'grade_10' },
        { label: 'Grade 11', value: 'grade_11' },
      ],
    },
    { name: 'teacher', type: 'relationship', relationTo: 'teachers' },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'isActive', type: 'checkbox', defaultValue: true, index: true },
    { name: 'displayOrder', type: 'number', defaultValue: 0, index: true },
  ],
  timestamps: true,
}

import type { CollectionConfig, Where } from 'payload'

import { admins, getRole, isAdminRole } from '@/access/roles'

export const Resources: CollectionConfig = {
  slug: 'resources',
  labels: {
    singular: 'Learning Resource',
    plural: 'Learning Resources',
  },
  admin: {
    group: 'Academics',
    useAsTitle: 'title',
    defaultColumns: ['title', 'class', 'resourceType', 'visibility', 'isPublished'],
  },
  access: {
    create: admins,
    delete: admins,
    read: async ({ req }) => {
      if (isAdminRole(getRole(req.user))) return true
      if (!req.user) {
        return { isPublished: { equals: true }, visibility: { equals: 'public' } }
      }

      const approvedEnrollments = await req.payload.find({
        collection: 'enrollments',
        depth: 0,
        limit: 100,
        overrideAccess: true,
        req,
        where: {
          and: [{ user: { equals: req.user.id } }, { status: { equals: 'approved' } }],
        },
      })
      const classIDs = approvedEnrollments.docs.map((item) =>
        typeof item.class === 'object' ? item.class.id : item.class,
      )
      const where: Where = {
        isPublished: { equals: true },
        or: [
          { visibility: { equals: 'public' } },
          {
            and: [
              { visibility: { equals: 'enrolled_students' } },
              { class: { in: classIDs.length ? classIDs : [-1] } },
            ],
          },
        ],
      }
      return where
    },
    update: admins,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'class', type: 'relationship', relationTo: 'classes', required: true },
    {
      name: 'resourceType',
      type: 'select',
      options: ['pdf', 'document', 'video', 'link', 'image'],
      required: true,
    },
    { name: 'file', type: 'upload', relationTo: 'media' },
    { name: 'externalUrl', type: 'text' },
    {
      name: 'visibility',
      type: 'select',
      options: ['public', 'enrolled_students', 'admins_only'],
      defaultValue: 'enrolled_students',
      required: true,
    },
    { name: 'isPublished', type: 'checkbox', defaultValue: true, index: true },
    { name: 'uploadedBy', type: 'relationship', relationTo: 'users' },
  ],
  timestamps: true,
}

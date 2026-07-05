import type { CollectionConfig, Where } from 'payload'

import { admins, getRole, isAdminRole } from '@/access/roles'

export const Notices: CollectionConfig = {
  slug: 'notices',
  labels: {
    singular: 'Notice',
    plural: 'Notices',
  },
  admin: {
    group: 'Academics',
    useAsTitle: 'title',
    defaultColumns: ['title', 'targetType', 'priority', 'publishDate', 'isPublished'],
  },
  access: {
    create: admins,
    delete: admins,
    read: async ({ req }) => {
      if (isAdminRole(getRole(req.user))) return true
      if (!req.user) return false

      const now = new Date().toISOString()
      const publishedWindow: Where = {
        and: [
          { isPublished: { equals: true } },
          { publishDate: { less_than_equal: now } },
          {
            or: [
              { expiryDate: { exists: false } },
              { expiryDate: { greater_than: now } },
            ],
          },
        ],
      }

      const students = await req.payload.find({
        collection: 'students',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        req,
        where: { user: { equals: req.user.id } },
      })
      const student = students.docs[0]
      if (!student) {
        return {
          and: [
            publishedWindow,
            { targetType: { equals: 'all' } },
          ],
        }
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
        and: [
          publishedWindow,
          {
            or: [
              { targetType: { equals: 'all' } },
              {
                and: [
                  { targetType: { equals: 'student' } },
                  { targetStudent: { equals: student.id } },
                ],
              },
              {
                and: [
                  { targetType: { equals: 'grade' } },
                  { gradeLevel: { equals: student.gradeLevel } },
                ],
              },
              {
                and: [
                  { targetType: { equals: 'class' } },
                  { targetClass: { in: classIDs.length ? classIDs : [-1] } },
                ],
              },
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
    { name: 'message', type: 'richText', required: true },
    {
      name: 'targetType',
      type: 'select',
      options: ['all', 'class', 'grade', 'student'],
      defaultValue: 'all',
      required: true,
    },
    {
      name: 'targetClass',
      type: 'relationship',
      relationTo: 'classes',
      admin: { condition: (_, siblingData) => siblingData?.targetType === 'class' },
    },
    {
      name: 'targetStudent',
      type: 'relationship',
      relationTo: 'students',
      admin: { condition: (_, siblingData) => siblingData?.targetType === 'student' },
    },
    {
      name: 'gradeLevel',
      type: 'text',
      admin: { condition: (_, siblingData) => siblingData?.targetType === 'grade' },
    },
    { name: 'priority', type: 'select', options: ['normal', 'important', 'urgent'], defaultValue: 'normal' },
    { name: 'publishDate', type: 'date', defaultValue: () => new Date().toISOString(), required: true },
    { name: 'expiryDate', type: 'date' },
    { name: 'isPublished', type: 'checkbox', defaultValue: true, index: true },
  ],
  timestamps: true,
}

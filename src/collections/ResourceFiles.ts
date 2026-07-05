import type { CollectionConfig, Where } from 'payload'

import path from 'path'
import { fileURLToPath } from 'url'

import { admins, getRole, isAdminRole } from '@/access/roles'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const emptyAccess: Where = { id: { in: [-1] } }

export const ResourceFiles: CollectionConfig = {
  slug: 'resource-files',
  labels: {
    singular: 'Resource File',
    plural: 'Resource Files',
  },
  admin: {
    group: 'Academics',
    hidden: true,
  },
  access: {
    create: admins,
    delete: admins,
    read: async ({ req }) => {
      if (isAdminRole(getRole(req.user))) return true

      const publicResourceWhere: Where = {
        and: [
          { isPublished: { equals: true } },
          { visibility: { equals: 'public' } },
        ],
      }

      if (!req.user?.id) {
        const publicResources = await req.payload.find({
          collection: 'resources',
          depth: 0,
          limit: 500,
          overrideAccess: true,
          req,
          select: { file: true },
          where: publicResourceWhere,
        })

        const publicFileIds = publicResources.docs
          .map((resource) =>
            resource.file && typeof resource.file === 'object' ? resource.file.id : resource.file,
          )
          .filter(Boolean)

        return publicFileIds.length ? { id: { in: publicFileIds } } : emptyAccess
      }

      const approvedEnrollments = await req.payload.find({
        collection: 'enrollments',
        depth: 0,
        limit: 100,
        overrideAccess: true,
        req,
        select: { class: true },
        where: {
          and: [{ user: { equals: req.user.id } }, { status: { equals: 'approved' } }],
        },
      })

      const classIDs = approvedEnrollments.docs.map((item) =>
        typeof item.class === 'object' ? item.class.id : item.class,
      )

      const accessibleResources = await req.payload.find({
        collection: 'resources',
        depth: 0,
        limit: 500,
        overrideAccess: true,
        req,
        select: { file: true },
        where: {
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
        },
      })

      const fileIds = accessibleResources.docs
        .map((resource) =>
          resource.file && typeof resource.file === 'object' ? resource.file.id : resource.file,
        )
        .filter(Boolean)

      return fileIds.length ? { id: { in: fileIds } } : emptyAccess
    },
    update: admins,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../protected/resource-files'),
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/*',
      'video/mp4',
      'video/webm',
    ],
  },
  timestamps: true,
}

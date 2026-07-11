import type { CollectionConfig } from 'payload'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { APIError } from 'payload'
import { admins, getRole, isAdminRole } from '@/access/roles'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const supabaseStorageEnabled = Boolean(
  process.env.SUPABASE_PROJECT_REF &&
    process.env.SUPABASE_STORAGE_BUCKET &&
    process.env.SUPABASE_STORAGE_ACCESS_KEY_ID &&
    process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY,
)

export const PaymentSlips: CollectionConfig = {
  slug: 'payment-slips',
  labels: {
    singular: 'Payment Slip',
    plural: 'Payment Slips',
  },
  admin: {
    group: 'Institute',
    useAsTitle: 'month',
    defaultColumns: ['student', 'month', 'gradeLevel', 'status', 'createdAt'],
    hidden: true,
  },
  access: {
    create: ({ req }) => isAdminRole(getRole(req.user)) || getRole(req.user) === 'student',
    read: ({ req }) => {
      if (isAdminRole(getRole(req.user))) return true
      if (!req.user?.id) return false
      return { user: { equals: req.user.id } }
    },
    update: admins,
    delete: admins,
  },
  fields: [
    {
      name: 'student',
      type: 'relationship',
      relationTo: 'students',
      required: true,
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'month',
      type: 'text', // e.g. "July 2026"
      required: true,
      index: true,
    },
    {
      name: 'gradeLevel',
      type: 'text', // e.g. "Grade 7"
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'approved', 'rejected'],
      defaultValue: 'pending',
      required: true,
      index: true,
    },
    {
      name: 'adminNotes',
      type: 'textarea',
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../protected/payment-slips'),
    mimeTypes: ['image/*', 'application/pdf'],
    adminThumbnail: 'thumbnail',
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation !== 'create') return data

        let studentId = data.student
        const isAdmin = isAdminRole(getRole(req.user))

        if (!isAdmin) {
          if (!req.user?.id || getRole(req.user) !== 'student') {
            throw new APIError('Only students can upload payment slips.', 403, null, true)
          }

          const students = await req.payload.find({
            collection: 'students',
            depth: 0,
            limit: 1,
            overrideAccess: true,
            req,
            where: { user: { equals: req.user.id } },
          })

          studentId = students.docs[0]?.id
        }

        if (!studentId) return data

        // Resolve student
        const student = await req.payload.findByID({
          collection: 'students',
          id: studentId,
          depth: 0,
          overrideAccess: true,
        })

        if (!student) {
          throw new APIError('Student record not found.', 400)
        }

        const studentUserID = typeof student.user === 'object' ? student.user.id : student.user

        if (!isAdmin && String(studentUserID) !== String(req.user?.id)) {
          throw new APIError('You can only upload payment slips for your own student record.', 403, null, true)
        }

        data.student = student.id
        data.user = studentUserID
        data.gradeLevel = student.gradeLevel

        // Format card number with a hyphen (e.g., IEM0051 -> IEM-0051)
        const rawId = student.cardNumber || 'unknown'
        const cardFormatted = String(rawId).replace(/^IEM/, 'IEM-')

        // Sanitize grade level: e.g. "Grade 7" -> "grade7"
        const rawGrade = data.gradeLevel || student.gradeLevel || 'unknown'
        const gradeSanitized = String(rawGrade).toLowerCase().replace(/[^a-z0-9]/g, '')

        // Sanitize month: e.g. "July 2026" -> "2026-07-july"
        const rawMonth = data.month || 'unknown'
        const monthSanitized = String(rawMonth)
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')

        // Get extension
        const ext = path.extname(data.filename).toLowerCase() || '.bin'

        const storagePrefix = `students/${cardFormatted}/${gradeSanitized}/payment-slips`
        const storageFilename = `${monthSanitized}${ext}`
        const newRelativeFilename = `${storagePrefix}/${storageFilename}`

        if (!supabaseStorageEnabled) {
          const baseDir = path.resolve(dirname, '../../protected/payment-slips')
          const fullDestDir = path.dirname(path.join(baseDir, newRelativeFilename))

          if (!fs.existsSync(fullDestDir)) {
            fs.mkdirSync(fullDestDir, { recursive: true })
          }

          data.filename = newRelativeFilename
        } else {
          data.prefix = storagePrefix
          data.filename = storageFilename
        }

        return data
      },
    ],
  },
}

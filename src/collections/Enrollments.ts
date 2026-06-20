import type { CollectionConfig } from 'payload'

import { admins, getRole, isAdminRole } from '@/access/roles'
import { gradeOptions } from '@/fields/gradeOptions'

const classCategoryToGrade = {
  grade_6: 'Grade 6',
  grade_7: 'Grade 7',
  grade_8: 'Grade 8',
  grade_9: 'Grade 9',
  grade_10: 'Grade 10',
  grade_11: 'Grade 11',
} as const

export const Enrollments: CollectionConfig = {
  slug: 'enrollments',
  labels: {
    singular: 'Enrollment',
    plural: 'Enrollments',
  },
  admin: {
    group: 'Institute',
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'class', 'phone', 'status', 'createdAt'],
  },
  access: {
    create: admins,
    delete: admins,
    read: ({ req }) => {
      if (isAdminRole(getRole(req.user))) return true
      if (!req.user?.id) return false
      return { user: { equals: req.user.id } }
    },
    update: admins,
  },
  fields: [
    {
      name: 'fullName',
      type: 'text',
      index: true,
      admin: { hidden: true },
    },
    {
      type: 'row',
      fields: [
        { name: 'student', type: 'relationship', relationTo: 'students', required: true },
        { name: 'user', type: 'relationship', relationTo: 'users', required: true },
        { name: 'class', type: 'relationship', relationTo: 'classes', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', required: true },
        { name: 'lastName', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', required: true },
        {
          name: 'gradeLevel',
          type: 'select',
          required: true,
          options: [...gradeOptions],
          index: true,
          admin: {
            readOnly: true,
            description: 'Automatically matched to the selected class.',
          },
        },
        { name: 'guardianName', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'guardianPhone', type: 'text' },
        {
          name: 'status',
          type: 'select',
          options: ['pending', 'approved', 'rejected', 'cancelled'],
          defaultValue: 'pending',
          required: true,
          index: true,
        },
        {
          name: 'approvedBy',
          type: 'relationship',
          relationTo: 'users',
          filterOptions: {
            role: {
              in: ['super_admin', 'admin'],
            },
          },
          admin: {
            description: 'Automatically set to the administrator who approves this enrollment.',
            readOnly: true,
          },
        },
      ],
    },
    { name: 'message', type: 'textarea' },
    { name: 'adminNote', type: 'textarea' },
    {
      name: 'approvedAt',
      type: 'date',
      admin: { readOnly: true },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        if (!data) return data
        const firstName = String(data.firstName ?? originalDoc?.firstName ?? '').trim()
        const lastName = String(data.lastName ?? originalDoc?.lastName ?? '').trim()
        data.fullName = [firstName, lastName].filter(Boolean).join(' ')

        const classRelation = data.class ?? originalDoc?.class
        if (classRelation) {
          const classID = typeof classRelation === 'object' ? classRelation.id : classRelation
          const classDoc = await req.payload.findByID({
            collection: 'classes',
            id: classID,
            depth: 0,
          })
          data.gradeLevel =
            classCategoryToGrade[classDoc.category as keyof typeof classCategoryToGrade]
        }

        return data
      },
    ],
    beforeChange: [
      ({ data, originalDoc, req }) => {
        if (
          data.status === 'approved' &&
          originalDoc?.status !== 'approved' &&
          req.user?.id
        ) {
          data.approvedBy = req.user.id
          data.approvedAt = new Date().toISOString()
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        const studentID = typeof doc.student === 'object' ? doc.student.id : doc.student
        const classID = typeof doc.class === 'object' ? doc.class.id : doc.class
        if (!studentID || !classID) return

        const student = await req.payload.findByID({
          collection: 'students',
          id: studentID,
          depth: 0,
          overrideAccess: true,
        })
        const existingClasses = (student.currentClasses || []).map((item) =>
          typeof item === 'object' ? item.id : item,
        )
        const isApproved = doc.status === 'approved'
        const currentClasses = isApproved
          ? [...new Set([...existingClasses, classID])]
          : existingClasses.filter((id) => id !== classID)
        const enrollmentStatus =
          doc.status === 'cancelled' ? 'inactive' : doc.status

        await req.payload.update({
          collection: 'students',
          id: studentID,
          overrideAccess: true,
          data: {
            enrollmentStatus,
            gradeLevel: doc.gradeLevel,
            preferredClass: classID,
            currentClasses,
          },
        })
      },
    ],
  },
  timestamps: true,
}

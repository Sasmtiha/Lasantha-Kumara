import type { CollectionConfig } from 'payload'

import { getRole, isAdminRole } from '@/access/roles'
import { gradeOptions } from '@/fields/gradeOptions'

const isAcademicStaff = (role: ReturnType<typeof getRole>) =>
  isAdminRole(role) || role === 'teacher'

export const Exams: CollectionConfig = {
  slug: 'exams',
  labels: {
    singular: 'English Exam',
    plural: 'English Exams',
  },
  admin: {
    group: 'Academic Records',
    useAsTitle: 'title',
    defaultColumns: ['title', 'gradeLevel', 'class', 'examDate', 'totalMarks', 'isPublished'],
  },
  access: {
    create: ({ req }) => isAcademicStaff(getRole(req.user)),
    delete: ({ req }) => isAcademicStaff(getRole(req.user)),
    read: ({ req }) =>
      isAcademicStaff(getRole(req.user)) || { isPublished: { equals: true } },
    update: ({ req }) => isAcademicStaff(getRole(req.user)),
  },
  defaultSort: '-examDate',
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'gradeLevel',
          type: 'select',
          required: true,
          options: [...gradeOptions],
          index: true,
        },
        {
          name: 'class',
          type: 'relationship',
          relationTo: 'classes',
          required: true,
          index: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'examType',
          type: 'select',
          required: true,
          options: ['Unit Test', 'Monthly Test', 'Term Test', 'Mock Exam', 'Final Exam'],
          defaultValue: 'Monthly Test',
        },
        {
          name: 'term',
          type: 'select',
          options: ['Term 1', 'Term 2', 'Term 3', 'Other'],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'examDate', type: 'date', required: true, index: true },
        {
          name: 'academicYear',
          type: 'number',
          required: true,
          defaultValue: () => new Date().getFullYear(),
          min: 2020,
          max: 2100,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'totalMarks', type: 'number', required: true, defaultValue: 100, min: 1 },
        { name: 'passMark', type: 'number', required: true, defaultValue: 40, min: 0 },
      ],
    },
    { name: 'description', type: 'textarea' },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      label: 'Publish results to students',
    },
  ],
  timestamps: true,
}

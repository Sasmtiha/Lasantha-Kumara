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
    components: {
      beforeList: ['@/components/ExamsCalendarListAction'],
    },
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
        {
          name: 'examType',
          type: 'select',
          required: true,
          options: ['Unit Test', 'Monthly Test', 'Term Test', 'Mock Exam', 'Final Exam'],
          defaultValue: 'Monthly Test',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'assessmentArea',
          label: 'Assessment Area',
          type: 'select',
          required: true,
          defaultValue: 'Overall English',
          options: [
            'Overall English',
            'Reading',
            'Writing',
            'Listening',
            'Speaking / Oral',
            'Grammar',
            'Vocabulary',
            'Assignment',
          ],
          admin: {
            description: 'The English skill or activity measured by this assessment.',
          },
        },
        {
          name: 'term',
          type: 'select',
          options: ['Term 1', 'Term 2', 'Term 3', 'Other'],
        },
        { name: 'examDate', type: 'date', required: true, index: true },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'academicYear',
          type: 'number',
          required: true,
          defaultValue: () => new Date().getFullYear(),
          min: 2020,
          max: 2100,
        },
        { name: 'totalMarks', type: 'number', required: true, defaultValue: 100, min: 1 },
        {
          name: 'passMark',
          type: 'number',
          required: true,
          defaultValue: 40,
          min: 0,
          validate: (
            value: null | number | undefined,
            { siblingData }: { siblingData?: Record<string, unknown> },
          ) => {
            if (typeof value !== 'number') return 'Pass mark is required.'
            const totalMarks = Number(siblingData?.totalMarks || 0)
            return value <= totalMarks || 'Pass mark cannot be greater than total marks.'
          },
        },
      ],
    },
    { name: 'description', type: 'textarea' },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      label: 'Publish results to students',
      admin: {
        className: 'exam-publish-field',
        description: 'Published results become visible in each student’s portal.',
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        const marks = await req.payload.find({
          collection: 'student-marks',
          depth: 0,
          limit: 1000,
          overrideAccess: true,
          pagination: false,
          where: { exam: { equals: doc.id } },
        })

        await Promise.all(
          marks.docs.map((mark) =>
            req.payload.update({
              collection: 'student-marks',
              id: mark.id,
              overrideAccess: true,
              data: {
                exam: doc.id,
                marksObtained: mark.marksObtained,
                student: typeof mark.student === 'object' ? mark.student.id : mark.student,
              },
            }),
          ),
        )
      },
    ],
  },
  timestamps: true,
}

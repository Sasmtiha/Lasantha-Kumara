import type { CollectionConfig, Where } from 'payload'

import { getRole, isAdminRole } from '@/access/roles'
import { gradeOptions } from '@/fields/gradeOptions'

const isAcademicStaff = (role: ReturnType<typeof getRole>) =>
  isAdminRole(role) || role === 'teacher'

const getLetterGrade = (percentage: number) => {
  if (percentage >= 75) return 'A'
  if (percentage >= 65) return 'B'
  if (percentage >= 55) return 'C'
  if (percentage >= 40) return 'S'
  return 'F'
}

export const StudentMarks: CollectionConfig = {
  slug: 'student-marks',
  labels: {
    singular: 'Student Mark',
    plural: 'Student Marks',
  },
  admin: {
    group: 'Academic Records',
    useAsTitle: 'recordLabel',
    defaultColumns: [
      'recordLabel',
      'gradeLevel',
      'exam',
      'marksObtained',
      'percentage',
      'letterGrade',
      'isPublished',
    ],
  },
  access: {
    create: ({ req }) => isAcademicStaff(getRole(req.user)),
    delete: ({ req }) => isAcademicStaff(getRole(req.user)),
    read: ({ req }) => {
      if (isAcademicStaff(getRole(req.user))) return true
      if (!req.user?.id) return false
      return {
        and: [
          { user: { equals: req.user.id } },
          { isPublished: { equals: true } },
        ],
      } as Where
    },
    update: ({ req }) => isAcademicStaff(getRole(req.user)),
  },
  defaultSort: '-examDate',
  fields: [
    {
      name: 'recordLabel',
      type: 'text',
      admin: { hidden: true },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'student',
          type: 'relationship',
          relationTo: 'students',
          required: true,
          index: true,
        },
        {
          name: 'exam',
          type: 'relationship',
          relationTo: 'exams',
          required: true,
          index: true,
        },
      ],
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        hidden: true,
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'gradeLevel',
          type: 'select',
          options: [...gradeOptions],
          required: true,
          index: true,
          admin: { readOnly: true },
        },
        {
          name: 'class',
          type: 'relationship',
          relationTo: 'classes',
          required: true,
          admin: { readOnly: true },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'marksObtained',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'totalMarks',
          type: 'number',
          required: true,
          min: 1,
          admin: { readOnly: true },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'percentage',
          type: 'number',
          admin: { readOnly: true },
        },
        {
          name: 'letterGrade',
          type: 'select',
          options: ['A', 'B', 'C', 'S', 'F'],
          admin: { readOnly: true },
        },
        {
          name: 'resultStatus',
          type: 'select',
          options: ['Pass', 'Fail'],
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: 'examDate',
      type: 'date',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    { name: 'teacherRemarks', type: 'textarea' },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      label: 'Visible in student portal',
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        if (!data?.student || !data?.exam) return data

        const studentID =
          typeof data.student === 'object' ? data.student.id : data.student
        const examID = typeof data.exam === 'object' ? data.exam.id : data.exam
        const [student, exam] = await Promise.all([
          req.payload.findByID({ collection: 'students', id: studentID, depth: 0 }),
          req.payload.findByID({ collection: 'exams', id: examID, depth: 0 }),
        ])

        const totalMarks = Number(exam.totalMarks || 100)
        const marksObtained = Number(data.marksObtained || 0)
        const percentage = Math.min(100, Math.max(0, (marksObtained / totalMarks) * 100))

        if (marksObtained > totalMarks) {
          throw new Error(`Marks obtained cannot exceed the exam total of ${totalMarks}.`)
        }

        data.user = typeof student.user === 'object' ? student.user.id : student.user
        data.gradeLevel = exam.gradeLevel
        data.class = typeof exam.class === 'object' ? exam.class.id : exam.class
        data.totalMarks = totalMarks
        data.percentage = Number(percentage.toFixed(2))
        data.letterGrade = getLetterGrade(percentage)
        data.resultStatus = marksObtained >= Number(exam.passMark || 40) ? 'Pass' : 'Fail'
        data.examDate = exam.examDate
        data.recordLabel = `${student.firstName} ${student.lastName} — ${exam.title}`

        return data
      },
    ],
  },
  timestamps: true,
}

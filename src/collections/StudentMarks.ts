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
          name: 'gradeLevel',
          type: 'select',
          options: [...gradeOptions],
          required: true,
          index: true,
          label: 'Student Grade',
          admin: {
            description: 'Choose the grade first to filter the student and exam lists.',
          },
        },
        {
          name: 'student',
          type: 'relationship',
          relationTo: 'students',
          required: true,
          index: true,
          filterOptions: ({ siblingData }) => {
            const gradeLevel = (siblingData as { gradeLevel?: string } | undefined)?.gradeLevel
            if (!gradeLevel) return false
            return { gradeLevel: { equals: gradeLevel } }
          },
          admin: {
            description: 'Only students from the selected grade are shown.',
          },
        },
        {
          name: 'exam',
          type: 'relationship',
          relationTo: 'exams',
          required: true,
          index: true,
          filterOptions: ({ siblingData }) => {
            const gradeLevel = (siblingData as { gradeLevel?: string } | undefined)?.gradeLevel
            if (!gradeLevel) return false
            return { gradeLevel: { equals: gradeLevel } }
          },
          admin: {
            description: 'Only exams from the selected grade are shown.',
          },
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
          name: 'class',
          type: 'relationship',
          relationTo: 'classes',
          required: true,
          admin: { readOnly: true },
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
      async ({ data, originalDoc, req }) => {
        const nextData = data || {}
        const studentRelation = nextData.student ?? originalDoc?.student
        const examRelation = nextData.exam ?? originalDoc?.exam
        if (!studentRelation || !examRelation) return nextData
        const selectedGrade = nextData.gradeLevel ?? originalDoc?.gradeLevel
        if (!selectedGrade) return nextData

        const studentID =
          typeof studentRelation === 'object' ? studentRelation.id : studentRelation
        const examID = typeof examRelation === 'object' ? examRelation.id : examRelation
        const [student, exam] = await Promise.all([
          req.payload.findByID({ collection: 'students', id: studentID, depth: 0 }),
          req.payload.findByID({ collection: 'exams', id: examID, depth: 0 }),
        ])

        if (student.gradeLevel !== selectedGrade) {
          throw new Error(
            `${student.firstName} ${student.lastName} is registered for ${student.gradeLevel}, not ${selectedGrade}.`,
          )
        }

        if (exam.gradeLevel !== selectedGrade) {
          throw new Error(
            `${exam.title} belongs to ${exam.gradeLevel}, not ${selectedGrade}.`,
          )
        }

        const totalMarks = Number(exam.totalMarks || 100)
        const marksObtained = Number(nextData.marksObtained ?? originalDoc?.marksObtained ?? 0)
        const percentage = Math.min(100, Math.max(0, (marksObtained / totalMarks) * 100))

        if (marksObtained > totalMarks) {
          throw new Error(`Marks obtained cannot exceed the exam total of ${totalMarks}.`)
        }

        nextData.user = typeof student.user === 'object' ? student.user.id : student.user
        nextData.gradeLevel = selectedGrade
        nextData.class = typeof exam.class === 'object' ? exam.class.id : exam.class
        nextData.totalMarks = totalMarks
        nextData.percentage = Number(percentage.toFixed(2))
        nextData.letterGrade = getLetterGrade(percentage)
        nextData.resultStatus = marksObtained >= Number(exam.passMark || 40) ? 'Pass' : 'Fail'
        nextData.examDate = exam.examDate
        nextData.recordLabel = `${student.firstName} ${student.lastName} — ${exam.title}`

        return nextData
      },
    ],
  },
  timestamps: true,
}

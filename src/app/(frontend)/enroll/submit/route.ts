import configPromise from '@payload-config'
import { commitTransaction, createLocalReq, getPayload, initTransaction, killTransaction } from 'payload'

import {
  isValidEnrollmentEmail,
  isValidEnrollmentPhone,
  normalizeEnrollmentEmail,
  normalizeEnrollmentPhone,
  normalizeEnrollmentText,
} from '@/utilities/enrollmentValidation'

type EnrollmentInput = {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  gradeLevel?: string
  preferredClass?: string
  guardianName?: string
  guardianPhone?: string
  message?: string
  terms?: string
}

const gradeToClassCategory = {
  'Grade 6': 'grade_6',
  'Grade 7': 'grade_7',
  'Grade 8': 'grade_8',
  'Grade 9': 'grade_9',
  'Grade 10': 'grade_10',
  'Grade 11': 'grade_11',
} as const

export async function POST(request: Request) {
  const input = (await request.json()) as EnrollmentInput
  const firstName = normalizeEnrollmentText(input.firstName, 80)
  const lastName = normalizeEnrollmentText(input.lastName, 80)
  const email = normalizeEnrollmentEmail(input.email)
  const phone = normalizeEnrollmentPhone(input.phone)
  const guardianName = normalizeEnrollmentText(input.guardianName, 120) || undefined
  const guardianPhone = normalizeEnrollmentPhone(input.guardianPhone) || undefined
  const message = normalizeEnrollmentText(input.message, 1000) || undefined
  const required = [firstName, lastName, email, phone, input.gradeLevel]

  if (
    required.some((value) => !String(value || '').trim()) ||
    !isValidEnrollmentEmail(email) ||
    !isValidEnrollmentPhone(phone)
  ) {
    return Response.json({ message: 'Please provide valid details in every required field.' }, { status: 400 })
  }
  if (!input.password || input.password.length < 8 || input.password !== input.confirmPassword) {
    return Response.json({ message: 'Use a matching password of at least 8 characters.' }, { status: 400 })
  }
  if (input.terms !== 'accepted') {
    return Response.json({ message: 'You must accept the enrollment terms.' }, { status: 400 })
  }

  const validGrades = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11'] as const
  type GradeLevel = (typeof validGrades)[number]
  const gradeInput = input.gradeLevel!
  if (!validGrades.includes(gradeInput as GradeLevel)) {
    return Response.json({ message: 'Please select a valid grade.' }, { status: 400 })
  }
  const gradeLevel = gradeInput as GradeLevel

  const payload = await getPayload({ config: configPromise })
  const classCategory = gradeToClassCategory[gradeLevel]
  const classesForGrade = await payload.find({
    collection: 'classes',
    where: {
      and: [
        { category: { equals: classCategory } },
        { isActive: { equals: true } }
      ]
    },
    limit: 1,
    overrideAccess: true,
  })

  const selectedClass = classesForGrade.docs[0]
  if (!selectedClass) {
    return Response.json({ message: `No active class found for ${gradeLevel}.` }, { status: 400 })
  }
  const preferredClass = selectedClass.id
  const currentYear = new Date().getFullYear()
  const startOfYear = new Date(currentYear, 0, 1).toISOString()
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999).toISOString()

  const [existingUserByEmail, existingUserByPhone, existingStudentByEmail, existingStudentByPhone, existingEnrollment] = await Promise.all([
    payload.find({
      collection: 'users',
      limit: 1,
      overrideAccess: true,
      where: { email: { equals: email } },
    }),
    payload.find({
      collection: 'users',
      limit: 1,
      overrideAccess: true,
      where: { phone: { equals: phone } },
    }),
    payload.find({
      collection: 'students',
      limit: 1,
      overrideAccess: true,
      where: { email: { equals: email } },
    }),
    payload.find({
      collection: 'students',
      limit: 1,
      overrideAccess: true,
      where: { phone: { equals: phone } },
    }),
    payload.find({
      collection: 'enrollments',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [
          {
            or: [{ email: { equals: email } }, { phone: { equals: phone } }],
          },
          {
            createdAt: { greater_than_equal: startOfYear },
          },
          {
            createdAt: { less_than_equal: endOfYear },
          },
          {
            status: { in: ['pending', 'approved'] },
          },
        ],
      },
    }),
  ])

  if (existingUserByEmail.totalDocs) {
    return Response.json(
      { message: 'An account already exists for this email. Please sign in.' },
      { status: 409 },
    )
  }
  if (existingUserByPhone.totalDocs) {
    return Response.json(
      { message: 'This phone number is already linked to an account. Please use a different number.' },
      { status: 409 },
    )
  }
  if (existingStudentByEmail.totalDocs) {
    return Response.json(
      { message: 'A student record already exists for this email address.' },
      { status: 409 },
    )
  }
  if (existingStudentByPhone.totalDocs) {
    return Response.json(
      { message: 'A student record already exists for this phone number.' },
      { status: 409 },
    )
  }
  if (existingEnrollment.totalDocs) {
    return Response.json(
      {
        message:
          'A student with this email address or phone number is already enrolled for the current year.',
      },
      { status: 409 },
    )
  }

  const payloadReq = await createLocalReq({}, payload)
  const startedTransaction = await initTransaction(payloadReq)

  try {
    const user = await payload.create({
      collection: 'users',
      overrideAccess: true,
      req: payloadReq,
      data: {
        email,
        password: input.password,
        firstName,
        lastName,
        phone,
        role: 'student',
        status: 'active',
      },
    })
    const student = await payload.create({
      collection: 'students',
      overrideAccess: true,
      req: payloadReq,
      data: {
        user: user.id,
        firstName,
        lastName,
        email,
        phone,
        gradeLevel,
        preferredClass,
        guardianName,
        guardianPhone,
        enrollmentStatus: 'pending',
        paymentStatus: 'unpaid',
      },
    })

    await payload.create({
      collection: 'enrollments',
      overrideAccess: true,
      req: payloadReq,
      data: {
        student: student.id,
        user: user.id,
        class: preferredClass,
        firstName,
        lastName,
        email,
        phone,
        gradeLevel,
        guardianName,
        guardianPhone,
        message,
        paymentStatus: 'unpaid',
        status: 'pending',
      },
    })

    if (startedTransaction) {
      await commitTransaction(payloadReq)
    }

    return Response.json({ success: true }, { status: 201 })
  } catch (error) {
    if (startedTransaction) {
      await killTransaction(payloadReq)
    }

    const message = error instanceof Error ? error.message : 'Enrollment could not be completed.'
    const status =
      typeof error === 'object' && error
        ? Number(
            (error as { status?: unknown; statusCode?: unknown }).status ??
              (error as { status?: unknown; statusCode?: unknown }).statusCode,
          ) || 500
        : 500
    const normalizedStatus = status >= 400 && status < 600 ? status : 500
    const isDuplicate = message.toLowerCase().includes('already') || normalizedStatus === 409

    return Response.json(
      {
        message: isDuplicate ? message : 'Enrollment could not be completed. Please try again.',
      },
      { status: isDuplicate ? normalizedStatus : 500 },
    )
  }
}

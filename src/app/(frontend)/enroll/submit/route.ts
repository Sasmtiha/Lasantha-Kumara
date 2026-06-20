import configPromise from '@payload-config'
import { getPayload } from 'payload'

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

export async function POST(request: Request) {
  const input = (await request.json()) as EnrollmentInput
  const required = [input.firstName, input.lastName, input.email, input.phone, input.gradeLevel, input.preferredClass]

  if (required.some((value) => !value?.trim()) || !input.email?.includes('@')) {
    return Response.json({ message: 'Please provide valid details in every required field.' }, { status: 400 })
  }
  if (!input.password || input.password.length < 8 || input.password !== input.confirmPassword) {
    return Response.json({ message: 'Use a matching password of at least 8 characters.' }, { status: 400 })
  }
  if (input.terms !== 'accepted') {
    return Response.json({ message: 'You must accept the enrollment terms.' }, { status: 400 })
  }

  const firstName = input.firstName!
  const lastName = input.lastName!
  const email = input.email!
  const phone = input.phone!
  const validGrades = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11'] as const
  type GradeLevel = (typeof validGrades)[number]
  const gradeInput = input.gradeLevel!
  if (!validGrades.includes(gradeInput as GradeLevel)) {
    return Response.json({ message: 'Please select a valid grade.' }, { status: 400 })
  }
  const gradeLevel = gradeInput as GradeLevel
  const preferredClass = Number(input.preferredClass)
  if (!Number.isInteger(preferredClass)) {
    return Response.json({ message: 'Please select a valid class.' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  const existing = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: email.toLowerCase() } },
  })
  if (existing.totalDocs) {
    return Response.json({ message: 'An account already exists for this email. Please sign in.' }, { status: 409 })
  }

  const user = await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      email: email.toLowerCase(),
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
    data: {
      user: user.id,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      gradeLevel,
      preferredClass,
      guardianName: input.guardianName,
      guardianPhone: input.guardianPhone,
      enrollmentStatus: 'pending',
    },
  })

  const duplicate = await payload.find({
    collection: 'enrollments',
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        { student: { equals: student.id } },
        { class: { equals: preferredClass } },
        { status: { in: ['pending', 'approved'] } },
      ],
    },
  })
  if (!duplicate.totalDocs) {
    await payload.create({
      collection: 'enrollments',
      overrideAccess: true,
      data: {
        student: student.id,
        user: user.id,
        class: preferredClass,
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        gradeLevel,
        guardianName: input.guardianName,
        guardianPhone: input.guardianPhone,
        message: input.message,
        status: 'pending',
      },
    })
  }

  return Response.json({ success: true }, { status: 201 })
}

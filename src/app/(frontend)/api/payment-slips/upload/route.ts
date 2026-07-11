import { NextRequest } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getMeUser } from '@/utilities/getMeUser'

const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
const maxFileSize = 5 * 1024 * 1024

const normalizeMonth = (value: FormDataEntryValue | null) =>
  typeof value === 'string' ? value.trim().slice(0, 40) : ''

export async function POST(request: NextRequest) {
  try {
    const auth = await getMeUser().catch(() => null)
    const loggedInUser = auth?.user
    if (!loggedInUser || loggedInUser.role !== 'student') {
      return Response.json({ error: 'Student access required.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const month = normalizeMonth(formData.get('month'))

    if (!file || !month) {
      return Response.json({ error: 'Missing required upload parameters.' }, { status: 400 })
    }

    if (!allowedMimeTypes.has(file.type) || file.size > maxFileSize) {
      return Response.json({ error: 'Upload a PDF or image under 5 MB.' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const studentResult = await payload.find({
      collection: 'students',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { user: { equals: loggedInUser.id } },
    })
    const student = studentResult.docs[0]

    if (!student) {
      return Response.json({ error: 'Student record not found.' }, { status: 400 })
    }

    // Check if there is an existing payment slip for the student, month and gradeLevel
    const existingSlips = await payload.find({
      collection: 'payment-slips',
      where: {
        and: [
          { student: { equals: student.id } },
          { month: { equals: month } },
          { gradeLevel: { equals: student.gradeLevel } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existingSlips.docs.length > 0) {
      // Delete the existing slip to trigger file deletion and ensure clean replacement
      await payload.delete({
        collection: 'payment-slips',
        id: existingSlips.docs[0].id,
        overrideAccess: true,
      })
    }

    const slip = await payload.create({
      collection: 'payment-slips',
      data: {
        student: student.id,
        user: loggedInUser.id,
        month,
        gradeLevel: student.gradeLevel,
        status: 'pending',
      },
      file: {
        data: fileBuffer,
        name: file.name,
        mimetype: file.type,
        size: file.size,
      },
      overrideAccess: true,
    })

    return Response.json({ success: true, slip })
  } catch (_error) {
    return Response.json({ error: 'Payment slip could not be uploaded.' }, { status: 500 })
  }
}

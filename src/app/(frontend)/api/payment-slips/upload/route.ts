import { NextRequest } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getMeUser } from '@/utilities/getMeUser'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const auth = await getMeUser().catch(() => null)
    const loggedInUser = auth?.user
    if (!loggedInUser || loggedInUser.role !== 'student') {
      return Response.json({ error: 'Student access required.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const studentId = formData.get('student') ? Number(formData.get('student')) : null
    const userId = formData.get('user') ? Number(formData.get('user')) : null
    const month = formData.get('month') as string | null
    const gradeLevel = formData.get('gradeLevel') as string | null

    if (!file || !studentId || !userId || !month || !gradeLevel) {
      return Response.json({ error: 'Missing required upload parameters.' }, { status: 400 })
    }

    // Ensure the student is only uploading for their own account
    if (loggedInUser.id !== userId) {
      return Response.json({ error: 'You are only allowed to upload payment slips for your own account.' }, { status: 403 })
    }

    const payload = await getPayload({ config: configPromise })
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // Resolve student record to get the card number
    const student = await payload.findByID({
      collection: 'students',
      id: studentId,
      depth: 0,
      overrideAccess: true,
    })

    if (!student) {
      return Response.json({ error: 'Student record not found.' }, { status: 400 })
    }

    // Format card number with a hyphen (e.g., IEM0051 -> IEM-0051)
    const rawId = student.cardNumber || 'unknown'
    const cardFormatted = String(rawId).replace(/^IEM/, 'IEM-')

    // Sanitize grade level: e.g. "Grade 7" -> "grade7"
    const rawGrade = gradeLevel || student.gradeLevel || 'unknown'
    const gradeSanitized = String(rawGrade).toLowerCase().replace(/[^a-z0-9]/g, '')

    // Sanitize month: e.g. "July 2026" -> "2026-07-july"
    const rawMonth = month || 'unknown'
    const monthSanitized = String(rawMonth)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    // Get extension
    const ext = path.extname(file.name).toLowerCase() || '.bin'

    // Define target nested filename/path
    const targetFilename = `students/${cardFormatted}/${gradeSanitized}/payment-slips/${monthSanitized}${ext}`

    // Check if there is an existing payment slip for the student, month and gradeLevel
    const existingSlips = await payload.find({
      collection: 'payment-slips',
      where: {
        and: [
          { student: { equals: studentId } },
          { month: { equals: month } },
          { gradeLevel: { equals: gradeLevel } },
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
        student: studentId,
        user: userId,
        month: month,
        gradeLevel: gradeLevel,
        status: 'pending',
      },
      file: {
        data: fileBuffer,
        name: targetFilename,
        mimetype: file.type,
        size: file.size,
      },
      overrideAccess: true,
    })

    return Response.json({ success: true, slip })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return Response.json({ error: msg }, { status: 500 })
  }
}

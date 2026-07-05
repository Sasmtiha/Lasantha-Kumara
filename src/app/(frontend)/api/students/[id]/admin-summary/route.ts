import { NextRequest } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getMeUser } from '@/utilities/getMeUser'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getMeUser().catch(() => null)
    const user = auth?.user
    if (!user) {
      return Response.json({ error: 'Please sign in again.' }, { status: 401 })
    }

    const allowedRoles = ['admin', 'super_admin', 'teacher']
    if (!allowedRoles.includes(user.role || '')) {
      return Response.json({ error: 'Access denied.' }, { status: 403 })
    }

    const { id } = await params
    const payload = await getPayload({ config: configPromise })

    // 1. Fetch Student details
    const student = await payload
      .findByID({
        collection: 'students',
        id: id,
        depth: 1,
        overrideAccess: true,
      })
      .catch(() => null)

    if (!student) {
      return Response.json({ error: 'Student not found.' }, { status: 404 })
    }

    // 2. Fetch Enrollments
    const enrollments = await payload.find({
      collection: 'enrollments',
      depth: 1,
      limit: 100,
      overrideAccess: true,
      sort: '-createdAt',
      where: { student: { equals: id } },
    })

    // 3. Fetch Marks
    const marks = await payload.find({
      collection: 'student-marks',
      depth: 1,
      limit: 200,
      overrideAccess: true,
      sort: '-examDate',
      where: { student: { equals: id } },
    })

    // 4. Fetch Payment Slips
    const slips = await payload.find({
      collection: 'payment-slips',
      depth: 1,
      limit: 100,
      overrideAccess: true,
      sort: '-createdAt',
      where: { student: { equals: id } },
    })

    // 5. Generate Billing History matches
    const latest = enrollments.docs[0]
    const joinDate = student.createdAt ? new Date(student.createdAt) : (latest?.createdAt ? new Date(latest.createdAt) : new Date())
    const currentDate = new Date()

    const billingHistory: {
      monthName: string
      expectedStatus: 'paid' | 'unpaid'
      slip?: (typeof slips.docs)[number] | null
    }[] = []

    const loopDate = new Date(joinDate.getFullYear(), joinDate.getMonth(), 1)
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    while (
      loopDate.getFullYear() < currentYear ||
      (loopDate.getFullYear() === currentYear && loopDate.getMonth() <= currentMonth)
    ) {
      const monthName = loopDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })
      const isCurrent = loopDate.getFullYear() === currentYear && loopDate.getMonth() === currentMonth
      
      const studentStatus = student.paymentStatus || latest?.paymentStatus || 'unpaid'
      const expectedStatus = isCurrent ? (studentStatus as 'paid' | 'unpaid') : 'paid'

      // Match with uploaded slips
      const matchedSlip = slips.docs.find(
        (s) => String(s.month).toLowerCase().trim() === monthName.toLowerCase().trim()
      )

      billingHistory.push({
        monthName,
        expectedStatus,
        slip: matchedSlip || null,
      })

      loopDate.setMonth(loopDate.getMonth() + 1)
    }

    billingHistory.reverse()

    return Response.json({
      student,
      enrollments: enrollments.docs,
      marks: marks.docs,
      billingHistory,
      slips: slips.docs,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return Response.json({ error: msg }, { status: 500 })
  }
}

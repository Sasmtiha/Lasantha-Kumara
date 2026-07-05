import { NextRequest } from 'next/server'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { getMeUser } from '@/utilities/getMeUser'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getMeUser().catch(() => null)
    const user = auth?.user
    if (!user) {
      return Response.json({ error: 'Please sign in again.' }, { status: 401 })
    }

    const allowedRoles = ['admin', 'super_admin']
    if (!allowedRoles.includes(user.role || '')) {
      return Response.json({ error: 'Access denied.' }, { status: 403 })
    }

    const { id } = await params
    const body = (await request.json()) as { status: 'approved' | 'rejected' | 'pending'; adminNotes?: string }
    
    if (!['approved', 'rejected', 'pending'].includes(body.status)) {
      return Response.json({ error: 'Invalid status value.' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // 1. Update the payment slip
    const slip = await payload.update({
      collection: 'payment-slips',
      id: id,
      overrideAccess: true,
      data: {
        status: body.status,
        adminNotes: body.adminNotes || undefined,
      },
    })

    // 2. Sync to student's paymentStatus if it is for the current month
    // Get month name of current month
    const currentMonthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
    const isCurrentMonth = String(slip.month).toLowerCase().trim() === currentMonthName.toLowerCase().trim()

    if (isCurrentMonth) {
      const studentId = typeof slip.student === 'object' ? slip.student.id : slip.student

      if (!studentId) {
        return Response.json({ error: 'Payment slip is not linked to a student.' }, { status: 400 })
      }
      
      await payload.update({
        collection: 'students',
        id: studentId,
        overrideAccess: true,
        data: {
          paymentStatus: body.status === 'approved' ? 'paid' : 'unpaid',
        },
      })
    }

    return Response.json({ success: true, slip })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error'
    return Response.json({ error: msg }, { status: 500 })
  }
}

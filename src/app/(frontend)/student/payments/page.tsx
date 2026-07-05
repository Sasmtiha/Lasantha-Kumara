import React from 'react'
import { CreditCard, CalendarDays, CheckCircle2, AlertCircle, Clock, AlertTriangle } from 'lucide-react'

import type { PaymentSlip } from '@/payload-types'
import { getStudentPortalData } from '@/utilities/studentPortal'
import { PaymentSlipUpload } from '@/components/PaymentSlipUpload'

export default async function StudentPaymentsPage() {
  const { enrollments, student, payload, user } = await getStudentPortalData()
  const approved = enrollments.filter((item) => item.status === 'approved')
  const latest = enrollments[0]

  // Get the first class title or fallback
  const firstApprovedClass = approved[0]?.class
  const className = typeof firstApprovedClass === 'object' ? firstApprovedClass.titleEn : 'Monthly Tuition'

  // Fetch payment slips for this student
  let slipsDocs: PaymentSlip[] = []
  if (student?.id) {
    const slips = await payload.find({
      collection: 'payment-slips',
      limit: 100,
      overrideAccess: true,
      where: {
        student: { equals: student.id },
      },
    })
    slipsDocs = slips.docs
  }

  // Generate monthly payment records since the student enrolled
  const joinDate = student?.createdAt ? new Date(student.createdAt) : (latest?.createdAt ? new Date(latest.createdAt) : new Date())
  const currentDate = new Date()

  const paymentRecords: {
    monthName: string
    status: 'paid' | 'unpaid' | 'pending' | 'rejected'
    isCurrent: boolean
  }[] = []

  const loopDate = new Date(joinDate.getFullYear(), joinDate.getMonth(), 1)
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  while (
    loopDate.getFullYear() < currentYear ||
    (loopDate.getFullYear() === currentYear && loopDate.getMonth() <= currentMonth)
  ) {
    const isCurrent = loopDate.getFullYear() === currentYear && loopDate.getMonth() === currentMonth
    const monthName = loopDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    
    // Check if there is an uploaded slip for this month
    const slip = slipsDocs.find((s) => String(s.month).toLowerCase().trim() === monthName.toLowerCase().trim())
    
    let status: 'paid' | 'unpaid' | 'pending' | 'rejected' = 'unpaid'
    if (slip) {
      if (slip.status === 'approved') status = 'paid'
      else if (slip.status === 'rejected') status = 'rejected'
      else status = 'pending'
    } else {
      const studentStatus = student?.paymentStatus || latest?.paymentStatus || 'unpaid'
      status = isCurrent ? (studentStatus as 'paid' | 'unpaid') : 'paid'
    }

    paymentRecords.push({
      monthName,
      status,
      isCurrent,
    })

    // Advance by 1 month
    loopDate.setMonth(loopDate.getMonth() + 1)
  }

  // Show most recent month first
  paymentRecords.reverse()

  const currentMonthRecord = paymentRecords.find((r) => r.isCurrent)
  const currentMonthStatus = currentMonthRecord?.status || 'unpaid'

  return (
    <div className="py-12">
      <p className="premium-kicker text-[#034EA2]">Billing & Fees</p>
      <h1 className="mt-3 text-4xl font-medium tracking-[-.025em] text-[#111827]">My Payments</h1>
      <p className="mt-3 text-[#6b7280]">View your monthly tuition payment history and status.</p>

      {/* Current Month Callout Box */}
      <div className="mt-9">
        {currentMonthStatus === 'paid' && (
          <div className="flex flex-col gap-4 rounded-md border border-green-200 bg-green-50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-green-100 text-green-700">
                <CheckCircle2 className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold text-green-900">Tuition Paid for {currentMonthRecord?.monthName}</h3>
                <p className="mt-1 text-sm text-green-700">
                  Thank you! Your payment for the current month has been successfully processed and verified.
                </p>
              </div>
            </div>
            <div className="shrink-0 text-sm font-bold text-green-800 uppercase tracking-wider bg-green-200/50 px-3.5 py-1.5 rounded">
              Status: Paid
            </div>
          </div>
        )}

        {currentMonthStatus === 'pending' && (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-100 text-[#034EA2]">
                  <Clock className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-blue-900">Tuition Slip Under Review for {currentMonthRecord?.monthName}</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Your payment slip has been uploaded and is currently awaiting verification from the institute administration.
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-sm font-bold text-[#034EA2] uppercase tracking-wider bg-blue-200/50 px-3.5 py-1.5 rounded w-fit">
                Awaiting Review
              </div>
            </div>
            {student?.id && (
              <div className="mt-6 border-t border-blue-200/60 pt-6">
                <p className="text-xs text-blue-800 font-semibold">Need to replace your uploaded slip? Upload a new one below:</p>
                <PaymentSlipUpload
                  studentId={String(student.id)}
                  userId={String(user.id)}
                  month={currentMonthRecord?.monthName || ''}
                  gradeLevel={student.gradeLevel || 'Grade 7'}
                />
              </div>
            )}
          </div>
        )}

        {currentMonthStatus === 'rejected' && (
          <div className="rounded-md border border-red-200 bg-red-50 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-100 text-red-700">
                  <AlertTriangle className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-red-900">Tuition Slip Rejected for {currentMonthRecord?.monthName}</h3>
                  <p className="mt-1 text-sm text-red-700">
                    The uploaded payment slip was rejected by the administration. Please upload a valid payment slip below or make your payment at the counter.
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-sm font-bold text-red-800 uppercase tracking-wider bg-red-200/50 px-3.5 py-1.5 rounded w-fit">
                Status: Rejected
              </div>
            </div>
            {student?.id && (
              <PaymentSlipUpload
                studentId={String(student.id)}
                userId={String(user.id)}
                month={currentMonthRecord?.monthName || ''}
                gradeLevel={student.gradeLevel || 'Grade 7'}
              />
            )}
          </div>
        )}

        {currentMonthStatus === 'unpaid' && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700">
                  <AlertCircle className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-amber-900">Tuition Unpaid for {currentMonthRecord?.monthName}</h3>
                  <p className="mt-1 text-sm text-amber-700">
                    Your monthly tuition fee is currently unpaid. Please complete your payment through the institute counter or upload your payment slip here.
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-sm font-bold text-amber-800 uppercase tracking-wider bg-amber-200/50 px-3.5 py-1.5 rounded w-fit">
                Status: Unpaid
              </div>
            </div>
            {student?.id && (
              <PaymentSlipUpload
                studentId={String(student.id)}
                userId={String(user.id)}
                month={currentMonthRecord?.monthName || ''}
                gradeLevel={student.gradeLevel || 'Grade 7'}
              />
            )}
          </div>
        )}
      </div>

      {/* Payment History List */}
      <section className="mt-10 rounded-md border border-black/8 bg-white overflow-hidden shadow-[0_16px_45px_rgba(15,23,42,.055)]">
        <div className="border-b border-black/8 px-6 py-5 bg-[#fcfcfc] flex items-center gap-2.5">
          <CreditCard className="size-5 text-[#034EA2]" />
          <h2 className="font-semibold text-[#111827]">Payment History</h2>
        </div>

        <div className="divide-y divide-black/6">
          {paymentRecords.map((record, index) => (
            <div
              key={index}
              className={`flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between ${
                record.isCurrent ? 'bg-[#f8faff]' : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="grid size-10 place-items-center rounded-md bg-gray-50 text-gray-500 border border-black/5">
                  <CalendarDays className="size-5" />
                </span>
                <div>
                  <h3 className="font-medium text-[#111827]">{record.monthName}</h3>
                  <p className="text-xs text-[#6b7280] mt-0.5">{className}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {record.status === 'paid' && (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 border border-green-200/60">
                    Paid
                  </span>
                )}
                {record.status === 'pending' && (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#034EA2] border border-blue-200/60">
                    Awaiting Review
                  </span>
                )}
                {record.status === 'rejected' && (
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 border border-red-200/60">
                    Rejected
                  </span>
                )}
                {record.status === 'unpaid' && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200/60">
                    Unpaid
                  </span>
                )}
                {record.isCurrent && (
                  <span className="inline-flex items-center rounded-full bg-[#034EA2]/10 px-2.5 py-1 text-xs font-semibold text-[#034EA2] border border-[#034EA2]/20">
                    Current Month
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}


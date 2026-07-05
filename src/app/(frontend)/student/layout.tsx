import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { PortalNav } from '@/components/institute/PortalNav'
import { getMeUser } from '@/utilities/getMeUser'
import { formatStudentId } from '@/utilities/studentCardNumber'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getMeUser({ nullUserRedirect: '/login' })
  if (user.role !== 'student') redirect('/')

  // Fetch student record for card number display
  const payload = await getPayload({ config: configPromise })
  const studentResult = await payload.find({
    collection: 'students',
    limit: 1,
    overrideAccess: true,
    where: { user: { equals: user.id } },
  })
  const student = studentResult.docs[0] || null
  const cardDisplay = formatStudentId(student?.cardNumber as number | null | undefined)

  return (
    <main className="student-portal flex-1 bg-[#f5f7fb] pb-20 text-[#111827]">
      <section className="relative overflow-hidden bg-[#034B9B] py-12 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,.09),transparent_45%)]" />
        <div className="premium-container relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-white/65">IEM Student Portal</p>
            <h1 className="mt-3 text-3xl font-medium tracking-[-.02em] sm:text-4xl">
              Your learning workspace
            </h1>
            <p className="mt-3 max-w-xl text-white/70">
              Classes, schedules, learning materials and institute updates in one place.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-tr from-white/20 to-white/10 text-white border border-white/15 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] font-bold text-base tracking-wide select-none">
              {((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase() || 'S'}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/50">Signed in as</p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'Student'}
              </p>
              {cardDisplay ? (
                <span className="mt-1.5 inline-block rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-white/90">
                  {cardDisplay}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      <div className="premium-container relative -mt-5">
        <PortalNav />
      </div>
      <div className="premium-container">
        {user.mustChangePassword ? (
          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <strong className="font-semibold">Temporary password in use.</strong>{' '}
            <Link className="font-semibold underline" href="/student/profile?changePassword=1">
              Change your password from the profile page.
            </Link>
          </div>
        ) : null}
        {children}
      </div>
    </main>
  )
}

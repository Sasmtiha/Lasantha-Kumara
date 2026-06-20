import React from 'react'

import { PortalNav } from '@/components/institute/PortalNav'
import { getMeUser } from '@/utilities/getMeUser'
import { redirect } from 'next/navigation'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getMeUser({ nullUserRedirect: '/login' })
  if (user.role !== 'student') redirect('/')

  return (
    <main className="student-portal flex-1 bg-[#f5f7fb] pb-20">
      <section className="relative overflow-hidden bg-[#034B9B] py-12 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,.09),transparent_45%)]" />
        <div className="premium-container relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-white/65">IEM.lk Student Portal</p>
            <h1 className="mt-3 text-3xl font-medium tracking-[-.02em] sm:text-4xl">
              Your learning workspace
            </h1>
            <p className="mt-3 max-w-xl text-white/70">
              Classes, schedules, learning materials and institute updates in one place.
            </p>
          </div>
          <div className="rounded-md border border-white/15 bg-white/10 px-5 py-3 backdrop-blur">
            <p className="text-xs uppercase tracking-wider text-white/55">Signed in as</p>
            <p className="mt-1 font-semibold">{user.firstName || 'Student'}</p>
          </div>
        </div>
      </section>
      <div className="premium-container relative -mt-5">
        <PortalNav />
      </div>
      <div className="premium-container">{children}</div>
    </main>
  )
}

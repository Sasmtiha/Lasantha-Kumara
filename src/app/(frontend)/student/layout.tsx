import React from 'react'

import { PortalNav } from '@/components/institute/PortalNav'
import { getMeUser } from '@/utilities/getMeUser'
import { redirect } from 'next/navigation'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getMeUser({ nullUserRedirect: '/login' })
  if (user.role !== 'student') redirect('/')

  return (
    <main className="flex-1 bg-slate-50">
      <div className="bg-navy py-4"><div className="container"><PortalNav /></div></div>
      {children}
    </main>
  )
}

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

import { cn } from '@/utilities/ui'

const links = [
  ['/student/dashboard', 'Dashboard'],
  ['/student/profile', 'Profile'],
  ['/student/classes', 'My classes'],
  ['/student/schedule', 'Schedule'],
  ['/student/resources', 'Resources'],
  ['/student/notices', 'Notices'],
] as const

export function PortalNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/users/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav aria-label="Student portal" className="flex flex-wrap items-center gap-2">
      {links.map(([href, label]) => <Link className={cn('rounded-md px-3 py-2 text-sm font-semibold transition', pathname === href ? 'bg-[#034EA2] text-white' : 'text-white hover:bg-[#034EA2]')} href={href} key={href}>{label}</Link>)}
      <button className="rounded-md px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#034EA2]" onClick={logout} type="button">Log out</button>
    </nav>
  )
}

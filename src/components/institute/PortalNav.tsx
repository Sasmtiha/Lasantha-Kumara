'use client'

import {
  Bell,
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  UserRound,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

import { cn } from '@/utilities/ui'

const links = [
  ['/student/dashboard', 'Overview', LayoutDashboard],
  ['/student/classes', 'My Classes', GraduationCap],
  ['/student/schedule', 'Schedule', CalendarDays],
  ['/student/resources', 'Resources', BookOpen],
  ['/student/performance', 'Performance', TrendingUp],
  ['/student/notices', 'Notices', Bell],
  ['/student/profile', 'Profile', UserRound],
] as const

export function PortalNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/users/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <nav
      aria-label="Student portal"
      className="flex items-center gap-1 overflow-x-auto rounded-md border border-black/8 bg-white p-1.5 shadow-[0_14px_40px_rgba(15,23,42,.08)]"
    >
      {links.map(([href, label, Icon]) => {
        const active = pathname === href

        return (
          <Link
            className={cn(
              'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[.3rem] px-3.5 text-sm font-semibold transition duration-300',
              active
                ? 'bg-[#034EA2] text-white shadow-[0_8px_20px_rgba(3,78,162,.22)]'
                : 'text-[#4b5563] hover:bg-[#eef5ff] hover:text-[#034EA2]',
            )}
            href={href}
            key={href}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        )
      })}
      <span className="mx-1 hidden h-6 w-px shrink-0 bg-black/10 sm:block" />
      <button
        className="ml-auto inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[.3rem] px-3.5 text-sm font-semibold text-[#4b5563] transition hover:bg-[#111827] hover:text-white"
        onClick={logout}
        type="button"
      >
        <LogOut className="size-4" />
        Log out
      </button>
    </nav>
  )
}

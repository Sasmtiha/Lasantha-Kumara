'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header as HeaderType } from '@/payload-types'
import { cn } from '@/utilities/ui'

type HeaderUser = {
  firstName?: null | string
  role?: null | string
} | null

const getPortalURL = (role?: null | string) => {
  if (role === 'student') return '/student/dashboard'
  if (role === 'teacher') return '/teacher/dashboard'
  if (role === 'admin' || role === 'super_admin') return '/admin'
  return '/'
}

export const HeaderNav = ({
  data,
  transparent,
  user,
}: {
  data: HeaderType
  transparent: boolean
  user: HeaderUser
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const navItems = data?.navItems || []

  useEffect(() => setOpen(false), [pathname])

  function toggleLanguage() {
    const nextLocale = document.documentElement.lang === 'si' ? 'en' : 'si'
    document.cookie = `site-locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`
    document.documentElement.lang = nextLocale
    router.refresh()
  }

  async function logout() {
    await fetch('/api/users/logout', { credentials: 'include', method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <nav aria-label="Main navigation" className="hidden items-center gap-1 xl:flex">
        {navItems.map(({ link }, index) => {
          const href =
            link.type === 'custom'
              ? link.url
              : typeof link.reference?.value === 'object'
                ? `/${link.reference.value.slug}`
                : undefined
          if (!href) return null
          return (
            <Link
              className="nav-underline rounded-lg px-3 py-2 text-sm font-semibold"
              href={href}
              key={index}
            >
              {link.label}
            </Link>
          )
        })}
        {data.showLanguageToggle ? (
          <button
            className={cn(
              'ml-2 rounded-full border px-3 py-2 text-xs font-bold',
              transparent ? 'border-white/30' : 'border-black/10',
            )}
            onClick={toggleLanguage}
            type="button"
          >
            EN / සිං
          </button>
        ) : null}
        <Link
          className={cn(
            'ml-2 rounded-full px-4 py-2.5 text-sm font-bold',
            transparent ? 'bg-white/10 text-white backdrop-blur' : 'bg-[#111827] text-white',
          )}
          href={user ? getPortalURL(user.role) : '/login'}
        >
          {user ? 'Dashboard' : 'Student Portal'}
        </Link>
        {user ? (
          <button className="rounded-full bg-[#ffc107] px-4 py-2.5 text-sm font-bold text-[#111827]" onClick={logout} type="button">
            Log out
          </button>
        ) : (
          <Link className="rounded-full bg-[#ffc107] px-4 py-2.5 text-sm font-bold text-[#111827]" href={data.primaryCTA?.url || '/enroll'}>
            {data.primaryCTA?.label || 'Enroll Now'}
          </Link>
        )}
      </nav>

      <button
        aria-expanded={open}
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        className={cn(
          'grid size-11 place-items-center rounded-full border xl:hidden',
          transparent ? 'border-white/30 bg-white/10' : 'border-black/10 bg-white',
        )}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open ? (
        <div className="fixed inset-0 top-20 z-50 overflow-y-auto bg-[#0f172a] px-6 py-8 text-white xl:hidden">
          <nav aria-label="Mobile navigation" className="mx-auto flex max-w-xl flex-col">
            {navItems.map(({ link }, index) => {
              const href = link.type === 'custom' ? link.url : '/'
              return (
                <Link className="border-b border-white/10 py-5 text-2xl font-bold" href={href || '/'} key={index}>
                  {link.label}
                </Link>
              )
            })}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link className="premium-button-light justify-center" href={user ? getPortalURL(user.role) : '/login'}>
                {user ? 'Dashboard' : 'Student Portal'}
              </Link>
              {user ? (
                <button className="premium-button-primary justify-center" onClick={logout} type="button">Log out</button>
              ) : (
                <Link className="premium-button-primary justify-center" href="/enroll">Enroll Now</Link>
              )}
            </div>
            {data.showLanguageToggle ? (
              <button className="mt-5 self-start text-sm font-bold text-[#ffc107]" onClick={toggleLanguage} type="button">
                Switch language · EN / සිං
              </button>
            ) : null}
          </nav>
        </div>
      ) : null}
    </>
  )
}

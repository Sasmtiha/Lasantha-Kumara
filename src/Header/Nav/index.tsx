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
  const [locale, setLocale] = useState<'en' | 'si'>('en')
  const navItems = data?.navItems || []

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    setLocale(document.documentElement.lang === 'si' ? 'si' : 'en')
  }, [])

  function toggleLanguage() {
    const nextLocale = locale === 'si' ? 'en' : 'si'
    document.cookie = `site-locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`
    document.documentElement.lang = nextLocale
    setLocale(nextLocale)
    router.refresh()
  }

  async function logout() {
    await fetch('/api/users/logout', { credentials: 'include', method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <nav aria-label="Main navigation" className="hidden items-center justify-center gap-1 xl:flex">
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
              className="nav-underline rounded-lg px-3 py-2 text-sm font-medium"
              href={href}
              key={index}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="hidden items-center justify-self-end gap-3 xl:flex">
        {data.showLanguageToggle ? (
          <button
            aria-label={`Switch to ${locale === 'en' ? 'Sinhala' : 'English'}`}
            className={cn(
              'relative grid grid-cols-2 rounded-full border p-1 text-xs font-medium',
              transparent ? 'border-white/25 bg-white/10' : 'border-black/10 bg-[#f2f2f0]',
            )}
            onClick={toggleLanguage}
            type="button"
          >
            <span
              className={cn(
                'relative z-10 rounded-full px-3 py-1.5 transition',
                locale === 'en'
                  ? 'bg-[#0a0b0f] text-white shadow-sm'
                  : transparent
                    ? 'text-white/60'
                    : 'text-[#034EA2]/55',
              )}
            >
              EN
            </span>
            <span
              className={cn(
                'relative z-10 rounded-full px-3 py-1.5 transition',
                locale === 'si'
                  ? 'bg-[#0a0b0f] text-white shadow-sm'
                  : transparent
                    ? 'text-white/60'
                    : 'text-[#034EA2]/55',
              )}
            >
              සිං
            </span>
          </button>
        ) : null}
        {user ? (
          <>
            <Link
              className={cn(
                'rounded-md px-4 py-2.5 text-sm font-medium transition',
                transparent
                  ? 'border border-white bg-transparent text-white hover:border-[#034EA2] hover:bg-[#034EA2]'
                  : 'border border-[#0a0b0f] bg-[#0a0b0f] text-white hover:border-[#034EA2] hover:bg-[#034EA2]',
              )}
              href={getPortalURL(user.role)}
            >
              Dashboard
            </Link>
            <button className="rounded-md border border-[#0a0b0f] bg-[#0a0b0f] px-5 py-2.5 text-sm font-medium text-white transition hover:border-[#034EA2] hover:bg-[#034EA2]" onClick={logout} type="button">
              Log out
            </button>
          </>
        ) : (
          <Link
            className={cn(
              'rounded-md border px-6 py-2.5 text-sm font-medium shadow-sm transition',
              transparent
                ? 'border-white bg-white text-[#0a0b0f] hover:border-[#034EA2] hover:bg-[#034EA2] hover:text-white'
                : 'border-[#0a0b0f] bg-[#0a0b0f] text-white hover:border-[#034EA2] hover:bg-[#034EA2]',
            )}
            href="/login"
          >
            Log In
          </Link>
        )}
      </div>

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
                <Link className="border-b border-white/10 py-5 text-2xl font-semibold" href={href || '/'} key={index}>
                  {link.label}
                </Link>
              )
            })}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {user ? (
                <>
                  <Link className="premium-button-light justify-center" href={getPortalURL(user.role)}>Dashboard</Link>
                  <button className="premium-button-primary justify-center" onClick={logout} type="button">Log out</button>
                </>
              ) : (
                <Link className="premium-button-primary justify-center sm:col-span-2" href="/login">Log In</Link>
              )}
            </div>
            {data.showLanguageToggle ? (
              <button className="mt-6 grid grid-cols-2 self-start rounded-full border border-white/20 bg-white/10 p-1 text-sm font-medium" onClick={toggleLanguage} type="button">
                <span className={cn('rounded-full px-4 py-2', locale === 'en' && 'bg-white text-[#0a0b0f]')}>English</span>
                <span className={cn('rounded-full px-4 py-2', locale === 'si' && 'bg-white text-[#0a0b0f]')}>සිංහල</span>
              </button>
            ) : null}
          </nav>
        </div>
      ) : null}
    </>
  )
}

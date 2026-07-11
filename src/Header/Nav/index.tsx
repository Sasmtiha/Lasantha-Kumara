'use client'

import { ArrowUpRight, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  open,
  setOpen,
}: {
  data: HeaderType
  transparent: boolean
  user: HeaderUser
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [locale, setLocale] = useState<'en' | 'si'>('en')
  const navItems = data?.navItems || []
  useEffect(() => {
    setLocale(document.documentElement.lang === 'si' ? 'si' : 'en')
  }, [])

  function toggleLanguage() {
    const nextLocale = locale === 'si' ? 'en' : 'si'
    document.cookie = `site-locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`
    document.documentElement.lang = nextLocale
    setLocale(nextLocale)
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

      <div className="hidden items-center justify-self-end gap-2 xl:flex">
        {data.showLanguageToggle ? (
          <button
            aria-label={`Switch to ${locale === 'en' ? 'Sinhala' : 'English'}`}
            className={cn(
              'relative grid h-11 grid-cols-2 rounded-[.35rem] border p-1 text-xs font-semibold backdrop-blur-md transition-colors duration-300',
              transparent ? 'border-white/30 bg-black/10' : 'border-black/10 bg-white',
            )}
            onClick={toggleLanguage}
            type="button"
          >
            <span
              className={cn(
                'relative z-10 grid min-w-11 place-items-center rounded-[.25rem] px-3 transition duration-300',
                locale === 'en'
                  ? transparent
                    ? 'bg-white text-[#0a0b0f]'
                    : 'bg-[#034EA2] text-white'
                  : transparent
                    ? 'text-white/70 hover:text-white'
                    : 'text-[#4b5563] hover:text-[#034EA2]',
              )}
            >
              EN
            </span>
            <span
              className={cn(
                'relative z-10 grid min-w-11 place-items-center rounded-[.25rem] px-3 transition duration-300',
                locale === 'si'
                  ? transparent
                    ? 'bg-white text-[#0a0b0f]'
                    : 'bg-[#034EA2] text-white'
                  : transparent
                    ? 'text-white/70 hover:text-white'
                    : 'text-[#4b5563] hover:text-[#034EA2]',
              )}
            >
              සිං
            </span>
          </button>
        ) : null}
        {user ? (
          <Link
            className={cn(
              'group inline-flex h-11 items-center gap-2 rounded-[.35rem] border px-5 text-sm font-semibold transition duration-300 hover:-translate-y-px',
              transparent
                ? 'border-white/70 bg-transparent text-white hover:border-white hover:bg-white hover:text-[#0a0b0f]'
                : 'border-[#034EA2] bg-[#034EA2] text-white hover:border-[#0a0b0f] hover:bg-[#0a0b0f]',
            )}
            href={getPortalURL(user.role)}
          >
            {user.role === 'student' ? 'Student Portal' : 'Dashboard'}
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        ) : (
          <Link
            className={cn(
              'group inline-flex h-11 items-center gap-2 rounded-[.35rem] border px-5 text-sm font-semibold transition duration-300 hover:-translate-y-px',
              transparent
                ? 'border-white/70 bg-transparent text-white hover:border-white hover:bg-white hover:text-[#0a0b0f]'
                : 'border-[#034EA2] bg-[#034EA2] text-white hover:border-[#0a0b0f] hover:bg-[#0a0b0f]',
            )}
            href="/login"
          >
            Log In
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        )}
      </div>

      <button
        aria-expanded={open}
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        className={cn(
          'grid size-11 place-items-center rounded-full border xl:hidden transition-colors',
          open
            ? 'border-black/10 bg-black/5 text-[#111827]'
            : transparent
              ? 'border-white/30 bg-white/10 text-white'
              : 'border-black/10 bg-white text-[#111827]',
        )}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open ? (
        <div className="absolute inset-x-0 bottom-0 top-20 z-50 overflow-y-auto bg-white border-t border-black/5 px-6 py-8 text-[#111827] xl:hidden">
          <nav aria-label="Mobile navigation" className="mx-auto flex max-w-xl flex-col">
            {navItems.map(({ link }, index) => {
              const href =
                link.type === 'custom'
                  ? link.url
                  : typeof link.reference?.value === 'object'
                    ? `/${link.reference.value.slug}`
                    : undefined
              if (!href) return null
              return (
                <Link className="border-b border-black/5 py-5 text-2xl font-semibold text-[#111827]" href={href} key={index}>
                  {link.label}
                </Link>
              )
            })}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {user ? (
                <Link className="premium-button-secondary justify-center sm:col-span-2" href={getPortalURL(user.role)}>
                  {user.role === 'student' ? 'Student Portal' : 'Dashboard'}
                </Link>
              ) : (
                <Link className="premium-button-primary justify-center sm:col-span-2" href="/login">Log In</Link>
              )}
            </div>
            {data.showLanguageToggle ? (
              <button className="mt-6 grid grid-cols-2 self-start rounded-full border border-black/10 bg-black/5 p-1 text-sm font-medium text-[#111827]" onClick={toggleLanguage} type="button">
                <span className={cn('rounded-full px-4 py-2 transition-colors duration-200', locale === 'en' && 'bg-[#034ea2] text-white')}>English</span>
                <span className={cn('rounded-full px-4 py-2 transition-colors duration-200', locale === 'si' && 'bg-[#034ea2] text-white')}>සිංහල</span>
              </button>
            ) : null}
          </nav>
        </div>
      ) : null}
    </>
  )
}

'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { cn } from '@/utilities/ui'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
  user: {
    firstName?: null | string
    role?: null | string
  } | null
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, user }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const isHome = pathname === '/'

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  const transparent = isHome && !scrolled

  return (
    <header
      className={cn(
        'site-header fixed inset-x-0 top-0 z-50 transition-all duration-300',
        transparent
          ? 'border-transparent bg-transparent text-white'
          : 'border-b border-black/5 bg-white/90 text-[#111827] shadow-[0_8px_30px_rgba(15,23,42,.06)] backdrop-blur-xl',
      )}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="premium-container relative grid min-h-20 grid-cols-[1fr_auto] items-center gap-5 py-3 xl:grid-cols-[1fr_auto_1fr]">
        <Link className="justify-self-start" href="/">
          <Logo loading="eager" priority="high" />
        </Link>
        <HeaderNav data={data} transparent={transparent} user={user} />
      </div>
    </header>
  )
}

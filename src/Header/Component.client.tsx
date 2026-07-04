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
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const isHome = pathname === '/'

  useEffect(() => {
    setHeaderTheme(null)
    setOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  useEffect(() => {
    let lastY = window.scrollY
    let ticking = false

    const update = () => {
      const currentY = window.scrollY
      setScrolled(currentY > 24)

      if (currentY <= 80) {
        setHidden(false)
      } else if (Math.abs(currentY - lastY) > 6) {
        setHidden(currentY > lastY)
      }

      lastY = currentY
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const transparent = isHome && !scrolled

  if (pathname.startsWith('/student')) {
    return null
  }

  return (
    <header
      className={cn(
        'site-header fixed inset-x-0 top-0 z-50 will-change-transform transition-[transform,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(.22,1,.36,1)]',
        open
          ? 'h-svh bg-[#0f172a] text-white translate-y-0'
          : hidden
            ? '-translate-y-[110%]'
            : 'translate-y-0',
        open
          ? ''
          : transparent
            ? 'border-transparent bg-transparent text-white'
            : 'border-b border-black/5 bg-white/90 text-[#111827] shadow-[0_8px_30px_rgba(15,23,42,.06)] backdrop-blur-xl',
      )}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="premium-container xl:relative grid min-h-20 grid-cols-[1fr_auto] items-center gap-5 py-3 xl:grid-cols-[1fr_auto_1fr]">
        <Link className="justify-self-start" href="/">
          <Logo loading="eager" priority="high" variant={transparent ? 'hero' : 'theme'} />
        </Link>
        <HeaderNav data={data} transparent={transparent} user={user} open={open} setOpen={setOpen} />
      </div>
    </header>
  )
}

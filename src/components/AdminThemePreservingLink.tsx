'use client'

import Link from 'next/link'
import React from 'react'

type AdminThemePreservingLinkProps = {
  children: React.ReactNode
  className?: string
  href: string
}

export function AdminThemePreservingLink({
  children,
  className,
  href,
}: AdminThemePreservingLinkProps) {
  const preserveTheme = () => {
    const theme = document.documentElement.getAttribute('data-theme')

    if (theme === 'dark' || theme === 'light') {
      window.localStorage.setItem('payload-theme', theme)
    }
  }

  return (
    <Link className={className} href={href} onClick={preserveTheme}>
      {children}
    </Link>
  )
}

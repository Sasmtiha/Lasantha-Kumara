'use client'

import { Moon, Sun } from 'lucide-react'
import React, { useEffect, useState } from 'react'

type AdminTheme = 'dark' | 'light'

export default function AdminThemeToggle() {
  const [theme, setTheme] = useState<AdminTheme>('light')

  useEffect(() => {
    const saved = window.localStorage.getItem('payload-theme')
    const initialTheme: AdminTheme = saved === 'dark' ? 'dark' : 'light'

    if (!saved) {
      window.localStorage.setItem('payload-theme', initialTheme)
    }

    document.documentElement.setAttribute('data-theme', initialTheme)
    setTheme(initialTheme)
  }, [])

  const toggleTheme = () => {
    const nextTheme: AdminTheme = theme === 'dark' ? 'light' : 'dark'
    window.localStorage.setItem('payload-theme', nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
    setTheme(nextTheme)
  }

  return (
    <button
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="iem-admin-theme-toggle"
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      type="button"
    >
      {theme === 'dark' ? <Sun aria-hidden /> : <Moon aria-hidden />}
      <span className="iem-admin-theme-toggle__label">
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </span>
    </button>
  )
}

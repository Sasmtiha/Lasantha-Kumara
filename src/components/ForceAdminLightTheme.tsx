'use client'

import { useLayoutEffect } from 'react'

export default function ForceAdminLightTheme() {
  useLayoutEffect(() => {
    window.localStorage.setItem('payload-theme', 'light')
    document.documentElement.setAttribute('data-theme', 'light')

    const observer = new MutationObserver(() => {
      if (document.documentElement.getAttribute('data-theme') !== 'light') {
        document.documentElement.setAttribute('data-theme', 'light')
      }
    })

    observer.observe(document.documentElement, {
      attributeFilter: ['data-theme'],
      attributes: true,
    })

    return () => observer.disconnect()
  }, [])

  return null
}

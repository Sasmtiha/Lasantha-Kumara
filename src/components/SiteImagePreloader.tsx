'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function SiteImagePreloader() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)
  const [pendingPathname, setPendingPathname] = useState<null | string>(null)
  const runIDRef = useRef(0)

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return

      const link = (event.target as Element | null)?.closest('a[href]')
      if (!(link instanceof HTMLAnchorElement)) return

      const url = new URL(link.href)
      const isSameOrigin = url.origin === window.location.origin
      const isHomeNavigation = url.pathname === '/' && window.location.pathname !== '/'

      if (isSameOrigin && isHomeNavigation) {
        setPendingPathname(url.pathname)
        setIsLeaving(false)
        setIsVisible(true)
      }
    }

    document.addEventListener('click', onDocumentClick, { capture: true })

    return () => {
      document.removeEventListener('click', onDocumentClick, { capture: true })
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return
    if (pendingPathname && pathname !== pendingPathname) return

    const runID = runIDRef.current + 1
    runIDRef.current = runID

    // Keep loader active for a default duration (1 second) to display the intro transition
    const timer = window.setTimeout(() => {
      if (runIDRef.current !== runID) return

      setIsLeaving(true)
      window.setTimeout(() => {
        if (runIDRef.current === runID) {
          setPendingPathname(null)
          setIsVisible(false)
        }
      }, 150)
    }, 1000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [isVisible, pathname, pendingPathname])

  if (!isVisible) return null

  const isNavigating = pendingPathname !== null

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={`site-loading-overlay ${
        isLeaving
          ? 'site-loading-overlay--exiting'
          : isNavigating
            ? 'site-loading-overlay--entering'
            : ''
      }`}
      role="status"
    >
      <div className="site-loading-overlay__bars" aria-hidden="true">
        <div className="site-loading-overlay__bar" />
        <div className="site-loading-overlay__bar" />
        <div className="site-loading-overlay__bar" />
        <div className="site-loading-overlay__bar" />
        <div className="site-loading-overlay__bar" />
      </div>
    </div>
  )
}

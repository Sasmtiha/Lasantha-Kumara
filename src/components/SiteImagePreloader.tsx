'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const minVisibleTime = 0
const settleDelay = 50
const maxWaitTime = 15000

const imageHasLoaded = (image: HTMLImageElement) =>
  image.complete && image.naturalWidth > 0

const waitForImage = async (image: HTMLImageElement) => {
  if (imageHasLoaded(image)) {
    await image.decode?.().catch(() => undefined)
    return
  }

  await new Promise<void>((resolve) => {
    const finish = () => resolve()

    image.addEventListener('load', finish, { once: true })
    image.addEventListener('error', finish, { once: true })
  })

  await image.decode?.().catch(() => undefined)
}

const getPageImages = () =>
  Array.from(document.images).filter(
    (image) => image.currentSrc || image.src || image.getAttribute('srcset'),
  )

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

    let isDone = false
    let settleTimer = 0
    let maxTimer = 0
    const runID = runIDRef.current + 1
    runIDRef.current = runID
    const startedAt = performance.now()

    const finish = () => {
      if (isDone) return
      isDone = true
      window.clearTimeout(settleTimer)
      window.clearTimeout(maxTimer)

      const remainingTime = Math.max(0, minVisibleTime - (performance.now() - startedAt))

      window.setTimeout(() => {
        if (runIDRef.current !== runID) return

        setIsLeaving(true)
        window.setTimeout(() => {
          if (runIDRef.current === runID) {
            setPendingPathname(null)
            setIsVisible(false)
          }
        }, 150)
      }, remainingTime)
    }

    const waitForPageImages = async () => {
      const images = getPageImages()

      images.forEach((image) => {
        image.loading = 'eager'
        ;(image as HTMLImageElement & { fetchPriority?: string }).fetchPriority = 'high'
      })

      if (!images.length) {
        finish()
        return
      }

      await Promise.all(images.map(waitForImage))
      finish()
    }

    const scheduleCheck = () => {
      window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(() => {
        void waitForPageImages()
      }, settleDelay)
    }

    const observer = new MutationObserver(scheduleCheck)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['src', 'srcset'],
      childList: true,
      subtree: true,
    })

    scheduleCheck()
    maxTimer = window.setTimeout(finish, maxWaitTime)

    window.addEventListener('load', scheduleCheck, { once: true })

    return () => {
      isDone = true
      observer.disconnect()
      window.clearTimeout(settleTimer)
      window.clearTimeout(maxTimer)
      window.removeEventListener('load', scheduleCheck)
    }
  }, [isVisible, pathname, pendingPathname])

  if (!isVisible) return null

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={`site-loading-overlay ${
        isLeaving ? 'site-loading-overlay--exiting' : 'site-loading-overlay--entering'
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

'use client'

import { useEffect, useState } from 'react'

const minVisibleTime = 500
const settleDelay = 450
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
  const [isVisible, setIsVisible] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    let isDone = false
    let settleTimer = 0
    let maxTimer = 0
    const startedAt = performance.now()
    document.documentElement.classList.add('site-images-loading')

    const finish = () => {
      if (isDone) return
      isDone = true
      window.clearTimeout(settleTimer)
      window.clearTimeout(maxTimer)

      const remainingTime = Math.max(0, minVisibleTime - (performance.now() - startedAt))

      window.setTimeout(() => {
        setIsLeaving(true)
        window.setTimeout(() => {
          document.documentElement.classList.remove('site-images-loading')
          setIsVisible(false)
        }, 300)
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
      document.documentElement.classList.remove('site-images-loading')
      observer.disconnect()
      window.clearTimeout(settleTimer)
      window.clearTimeout(maxTimer)
      window.removeEventListener('load', scheduleCheck)
    }
  }, [])

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

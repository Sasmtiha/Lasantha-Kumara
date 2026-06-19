'use client'

import { useEffect } from 'react'

const duration = 1200
const headerOffset = 88

const easeInOutCubic = (progress: number) =>
  progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2

export function SmoothAnchorScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animationFrame = 0

    const scrollToElement = (element: HTMLElement, updateHash = true) => {
      const targetY = Math.max(
        0,
        element.getBoundingClientRect().top + window.scrollY - headerOffset,
      )

      if (reducedMotion.matches) {
        window.scrollTo({ top: targetY })
      } else {
        const startY = window.scrollY
        const distance = targetY - startY
        const startTime = performance.now()

        cancelAnimationFrame(animationFrame)

        const animate = (currentTime: number) => {
          const progress = Math.min((currentTime - startTime) / duration, 1)
          window.scrollTo(0, startY + distance * easeInOutCubic(progress))

          if (progress < 1) animationFrame = requestAnimationFrame(animate)
        }

        animationFrame = requestAnimationFrame(animate)
      }

      if (updateHash) {
        window.history.pushState(null, '', `#${element.id}`)
      }
    }

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href*="#"]')
      if (!link) return

      const url = new URL(link.href, window.location.href)
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname ||
        !url.hash ||
        url.hash === '#'
      ) {
        return
      }

      const element = document.getElementById(decodeURIComponent(url.hash.slice(1)))
      if (!element) return

      event.preventDefault()
      scrollToElement(element)
    }

    document.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(animationFrame)
      document.removeEventListener('click', onClick)
    }
  }, [])

  return null
}

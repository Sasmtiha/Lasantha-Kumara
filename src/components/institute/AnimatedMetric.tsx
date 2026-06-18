'use client'

import { useEffect, useRef, useState } from 'react'

export function AnimatedMetric({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const target = Number.parseInt(value.replace(/\D/g, ''), 10)
  const suffix = value.replace(/[\d\s]/g, '')
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const element = ref.current
    if (!element || !Number.isFinite(target)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    setDisplay(`0${suffix}`)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const started = performance.now()
        const duration = 1100
        const tick = (now: number) => {
          const progress = Math.min((now - started) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplay(`${Math.round(target * eased)}${suffix}`)
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [suffix, target, value])

  return <span ref={ref}>{display}</span>
}

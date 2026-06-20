'use client'

import { useEffect, useRef, type ReactNode } from 'react'

import { cn } from '@/utilities/ui'

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.dataset.visible = 'true'
          element.dataset.revealPosition = 'visible'
        } else {
          element.dataset.visible = 'false'
          element.dataset.revealPosition =
            entry.boundingClientRect.top < 0 ? 'above' : 'below'
        }
      },
      { rootMargin: '-6% 0px -6% 0px', threshold: 0.08 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className={cn('reveal', className)}
      ref={ref}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

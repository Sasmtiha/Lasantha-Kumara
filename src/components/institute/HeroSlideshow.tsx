'use client'

import { useEffect, useMemo, useState } from 'react'

import { Media } from '@/components/Media'
import type { InstituteHeroBlock, Media as MediaType } from '@/payload-types'
import { cn } from '@/utilities/ui'

type HeroSlide = NonNullable<InstituteHeroBlock['heroSlides']>[number]

export function HeroSlideshow({
  duration = 7,
  fallback,
  slides,
}: {
  duration?: null | number
  fallback?: MediaType | null
  slides?: HeroSlide[] | null
}) {
  const images = useMemo(() => {
    const slideshowImages =
      slides
        ?.map((slide) => slide.image)
        .filter((image): image is MediaType => typeof image === 'object' && image !== null) || []

    if (slideshowImages.length) return slideshowImages
    return fallback ? [fallback] : []
  }, [fallback, slides])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (images.length < 2) return

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length)
    }, Math.max(4, duration || 7) * 1000)

    return () => window.clearInterval(interval)
  }, [duration, images.length])

  useEffect(() => {
    if (activeIndex >= images.length) setActiveIndex(0)
  }, [activeIndex, images.length])

  if (!images.length) {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,#034EA2_0%,#034EA2_38%,#101827_78%)]" />
    )
  }

  return (
    <>
      <div aria-hidden className="absolute inset-0">
        {images.map((image, index) => (
          <div
            className={cn('hero-slide', index === activeIndex && 'hero-slide-active')}
            key={`${image.id}-${index}`}
          >
            <Media
              fill
              imgClassName="object-cover"
              pictureClassName="absolute inset-0 block"
              preferredSize="xlarge"
              priority={index === 0}
              resource={image}
              size="100vw"
            />
          </div>
        ))}
      </div>

      {images.length > 1 ? (
        <div
          aria-label="Choose hero background"
          className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-2 sm:flex lg:right-10"
          role="tablist"
        >
          {images.map((image, index) => (
            <button
              aria-label={`Show background image ${index + 1}`}
              aria-selected={index === activeIndex}
              className={cn(
                'h-2.5 rounded-full border border-white/70 bg-white/35 shadow-sm transition-all duration-500',
                index === activeIndex ? 'w-8 bg-[#ed1d26]' : 'w-2.5 hover:bg-white/80',
              )}
              key={`${image.id}-${index}`}
              onClick={() => setActiveIndex(index)}
              role="tab"
              type="button"
            />
          ))}
        </div>
      ) : null}
    </>
  )
}

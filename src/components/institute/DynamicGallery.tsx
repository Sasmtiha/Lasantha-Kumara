'use client'

import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Media } from '@/components/Media'
import type { Gallery as GalleryItem } from '@/payload-types'
import { cn } from '@/utilities/ui'

type Locale = 'en' | 'si'

const collageSize = 8

export function DynamicGallery({
  items,
  locale,
}: {
  items: GalleryItem[]
  locale: Locale
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const selectedItem = selectedIndex === null ? null : items[selectedIndex]
  const collageGroups = useMemo(
    () =>
      Array.from({ length: Math.ceil(items.length / collageSize) }, (_, index) =>
        items.slice(index * collageSize, (index + 1) * collageSize),
      ),
    [items],
  )

  useEffect(() => {
    if (!selectedItem) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedIndex(null)
      if (event.key === 'ArrowLeft') {
        setSelectedIndex((current) =>
          current === null ? null : (current - 1 + items.length) % items.length,
        )
      }
      if (event.key === 'ArrowRight') {
        setSelectedIndex((current) =>
          current === null ? null : (current + 1) % items.length,
        )
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [items.length, selectedItem])

  return (
    <>
      {items.length ? (
        <div className="gallery-collages mt-10">
          {collageGroups.map((group, groupIndex) => (
            <div
              className="gallery-cluster"
              data-count={group.length}
              data-variant={groupIndex % 2 === 0 ? 'forward' : 'reverse'}
              key={groupIndex}
            >
              {group.map((item, itemIndex) => {
                const visibleIndex = groupIndex * collageSize + itemIndex

                return (
                  <button
                    aria-label={`View ${item.category} gallery image`}
                    className={cn('gallery-tile group', `gallery-tile-${itemIndex + 1}`)}
                    key={item.id}
                    onClick={() => setSelectedIndex(visibleIndex)}
                    type="button"
                  >
                    {item.url || (item.image && typeof item.image === 'object') ? (
                      <Media
                        fill
                        htmlElement={null}
                        imgClassName="object-cover transition duration-700 group-hover:scale-105"
                        pictureClassName="absolute inset-0 block"
                        preferredSize="medium"
                        resource={item.url ? item : item.image}
                        size="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : null}
                    <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/0 to-transparent opacity-20 transition duration-500 group-hover:opacity-85" />
                    <span className="absolute right-4 top-4 grid size-10 translate-y-2 place-items-center rounded-full bg-white/90 text-[#034EA2] opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100">
                      <ZoomIn className="size-4" />
                    </span>
                    <span className="absolute inset-x-0 bottom-0 translate-y-2 p-5 text-left text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="text-[11px] uppercase tracking-[.14em] text-[#75aff0]">
                        {item.category}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-3xl border border-dashed border-[#034EA2]/25 px-6 py-20 text-center text-[#6b7280]">
          No photos are available in this category yet.
        </div>
      )}

      {selectedItem ? (
        <div
          aria-label="Gallery image viewer"
          aria-modal="true"
          className="fixed inset-0 z-[100] grid place-items-center bg-[#070b14]/95 p-4 backdrop-blur-sm"
          onClick={() => setSelectedIndex(null)}
          role="dialog"
        >
          <button
            aria-label="Close image viewer"
            className="absolute right-5 top-5 z-20 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            onClick={() => setSelectedIndex(null)}
            type="button"
          >
            <X className="size-5" />
          </button>
          {items.length > 1 ? (
            <>
              <button
                aria-label="Previous image"
                className="absolute left-3 z-20 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
                onClick={(event) => {
                  event.stopPropagation()
                  setSelectedIndex(
                    ((selectedIndex ?? 0) - 1 + items.length) % items.length,
                  )
                }}
                type="button"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                aria-label="Next image"
                className="absolute right-3 z-20 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
                onClick={(event) => {
                  event.stopPropagation()
                  setSelectedIndex(((selectedIndex ?? 0) + 1) % items.length)
                }}
                type="button"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          ) : null}
          <figure
            className="relative h-[78vh] w-[min(88vw,80rem)]"
            onClick={(event) => event.stopPropagation()}
          >
            <Media
              fill
              htmlElement={null}
              imgClassName="object-contain"
              pictureClassName="absolute inset-0 block"
              preferredSize="xlarge"
              priority
              resource={selectedItem.url ? selectedItem : selectedItem.image}
              size="90vw"
            />
            <figcaption className="absolute inset-x-0 -bottom-12 text-center text-white">
              <span className="text-xs uppercase tracking-[.16em] text-[#75aff0]">
                {selectedItem.category}
              </span>
            </figcaption>
          </figure>
        </div>
      ) : null}
    </>
  )
}

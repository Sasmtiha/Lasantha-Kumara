import type { StaticImageData } from 'next/image'
import type { ElementType, Ref } from 'react'

import type { Gallery as GalleryType, Media as MediaType } from '@/payload-types'

export type MediaSizeKey =
  | 'thumbnail'
  | 'square'
  | 'small'
  | 'medium'
  | 'large'
  | 'xlarge'
  | 'og'

export interface Props {
  alt?: string
  className?: string
  fill?: boolean // for NextImage only
  htmlElement?: ElementType | null
  pictureClassName?: string
  imgClassName?: string
  onClick?: () => void
  onLoad?: () => void
  loading?: 'lazy' | 'eager' // for NextImage only
  disablePlaceholder?: boolean // avoids a temporary blur background for transparent artwork
  priority?: boolean // for NextImage only
  preferredSize?: MediaSizeKey // Payload image size to request when available
  ref?: Ref<HTMLImageElement | HTMLVideoElement | null>
  resource?: GalleryType | MediaType | string | number | null // for Payload uploads
  size?: string // for NextImage only
  src?: StaticImageData // for static media
  videoClassName?: string
}

import React from 'react'

import { ThemeLogo } from '@/components/ThemeLogo'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  variant?: 'hero' | 'theme' | 'light' | 'dark'
}

export const Logo = (props: Props) => {
  return (
    <span className={props.className}>
      <span className="flex items-center gap-3" aria-label="Institute of English Middeniya">
        <ThemeLogo
          imageClassName="h-12 w-auto object-contain"
          loading={props.loading}
          priority={props.priority}
          variant={props.variant}
        />
        <span className="flex flex-col justify-center text-[0.8rem] font-medium leading-[1.15] tracking-[0.09em] text-current sm:text-sm">
          <span>Institute of</span>
          <span>
            English
          </span>
          <span>Middeniya</span>
        </span>
      </span>
    </span>
  )
}

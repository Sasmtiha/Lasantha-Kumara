import React from 'react'

type ThemeLogoProps = {
  alt?: string
  className?: string
  imageClassName?: string
  loading?: 'eager' | 'lazy'
  priority?: 'auto' | 'high' | 'low'
  variant?: 'hero' | 'theme'
}

export const lightLogoSrc = '/IEM_logo_light_mode_blue_transparent.png'
export const darkLogoSrc = '/IEM_logo_dark_mode_white_transparent.png'
export const heroLogoSrc = '/IEM_logo_dark_mode_white_transparent.png'

export function ThemeLogo({
  alt = '',
  className,
  imageClassName,
  loading,
  priority,
  variant = 'theme',
}: ThemeLogoProps) {
  if (variant === 'hero') {
    return (
      <span className={['iem-theme-logo', className].filter(Boolean).join(' ')}>
        <img
          alt={alt}
          className={['iem-theme-logo__image', imageClassName].filter(Boolean).join(' ')}
          fetchPriority={priority}
          loading={loading}
          src={heroLogoSrc}
        />
      </span>
    )
  }

  return (
    <span className={['iem-theme-logo', className].filter(Boolean).join(' ')}>
      <img
        alt={alt}
        className={['iem-theme-logo__image iem-theme-logo__image--light', imageClassName]
          .filter(Boolean)
          .join(' ')}
        fetchPriority={priority}
        loading={loading}
        src={lightLogoSrc}
      />
      <img
        alt={alt}
        className={['iem-theme-logo__image iem-theme-logo__image--dark', imageClassName]
          .filter(Boolean)
          .join(' ')}
        fetchPriority={priority}
        loading={loading}
        src={darkLogoSrc}
      />
    </span>
  )
}

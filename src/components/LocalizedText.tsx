import type { ReactNode } from 'react'

export function LocalizedText({
  english,
  sinhala,
}: {
  english?: null | ReactNode
  sinhala?: null | ReactNode
}) {
  const fallback = english || ''

  return (
    <>
      <span className="i18n-text i18n-en">{fallback}</span>
      <span className="i18n-text i18n-si">{sinhala || fallback}</span>
    </>
  )
}

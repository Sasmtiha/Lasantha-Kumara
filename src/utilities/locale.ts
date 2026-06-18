import { cookies } from 'next/headers'

export type SiteLocale = 'en' | 'si'

export async function getSiteLocale(): Promise<SiteLocale> {
  const locale = (await cookies()).get('site-locale')?.value
  return locale === 'si' ? 'si' : 'en'
}

export function localized(locale: SiteLocale, english?: null | string, sinhala?: null | string) {
  return locale === 'si' && sinhala ? sinhala : english || ''
}

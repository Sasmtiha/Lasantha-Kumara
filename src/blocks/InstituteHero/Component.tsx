import Link from 'next/link'
import React from 'react'

import type { InstituteHeroBlock as InstituteHeroBlockProps } from '@/payload-types'
import { Media } from '@/components/Media'
import { getSiteLocale, localized } from '@/utilities/locale'

export async function InstituteHeroBlock(props: InstituteHeroBlockProps) {
  const { badgeEn, badgeSi, headingEn, headingSi, subheadingEn, subheadingSi, primaryButtonLabel, primaryButtonUrl, secondaryButtonLabel, secondaryButtonUrl, heroImage, metrics } = props
  const locale = await getSiteLocale()

  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,174,45,0.2),transparent_38%)]" />
      <div className="container relative grid min-h-[42rem] items-center gap-12 py-20 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-gold/40 bg-white/5 px-4 py-2 text-sm font-semibold text-gold">
            {localized(locale, badgeEn, badgeSi)}
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">{localized(locale, headingEn, headingSi)}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100">{localized(locale, subheadingEn, subheadingSi)}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link className="rounded-xl bg-gold px-6 py-3 font-bold text-navy transition hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold" href={primaryButtonUrl}>
              {primaryButtonLabel}
            </Link>
            {secondaryButtonLabel && secondaryButtonUrl ? (
              <Link className="rounded-xl border border-white/40 px-6 py-3 font-semibold transition hover:bg-white/10" href={secondaryButtonUrl}>
                {secondaryButtonLabel}
              </Link>
            ) : null}
          </div>
          {metrics?.length ? (
            <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-white/15 pt-8">
              {metrics.map((metric) => (
                <div key={metric.id}>
                  <dt className="text-sm text-blue-100">{localized(locale, metric.labelEn, metric.labelSi)}</dt>
                  <dd className="mt-1 text-2xl font-bold text-gold">{metric.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
        <div className="relative hidden lg:block">
          <div className="absolute -inset-6 rounded-[2.5rem] border border-gold/25" />
          {heroImage && typeof heroImage === 'object' ? (
            <Media className="relative overflow-hidden rounded-[2rem] shadow-2xl" imgClassName="aspect-[4/5] w-full object-cover" priority resource={heroImage} />
          ) : (
            <div className="relative aspect-[4/5] rounded-[2rem] bg-blue-900/50" />
          )}
        </div>
      </div>
    </section>
  )
}

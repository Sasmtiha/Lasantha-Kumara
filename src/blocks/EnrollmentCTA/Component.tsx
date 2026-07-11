import Link from 'next/link'
import React from 'react'

import type { EnrollmentCTABlock as Props } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { LocalizedText } from '@/components/LocalizedText'

export async function EnrollmentCTABlock({ headingEn, headingSi, descriptionEn, descriptionSi, buttonLabel, buttonUrl, backgroundStyle }: Props) {
  return (
    <section className="container py-12">
      <div className={cn('rounded-[2rem] px-7 py-14 text-center sm:px-12', backgroundStyle === 'navy' && 'bg-navy text-white', backgroundStyle === 'gold' && 'bg-gold text-navy', backgroundStyle === 'light' && 'bg-blue-50 text-navy')}>
        <h2 className="text-3xl font-bold sm:text-4xl">
          <LocalizedText english={headingEn} sinhala={headingSi} />
        </h2>
        {descriptionEn || descriptionSi ? (
          <p className="mx-auto mt-4 max-w-2xl text-lg opacity-80">
            <LocalizedText english={descriptionEn} sinhala={descriptionSi} />
          </p>
        ) : null}
        <Link className={cn('mt-8 inline-flex rounded-xl px-6 py-3 font-bold', backgroundStyle === 'navy' ? 'bg-gold text-navy' : 'bg-navy text-white')} href={buttonUrl}>{buttonLabel}</Link>
      </div>
    </section>
  )
}

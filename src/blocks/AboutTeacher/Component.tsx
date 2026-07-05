import { Award, BookOpen, Target, Users } from 'lucide-react'
import React from 'react'

import type { AboutTeacherBlock as AboutTeacherBlockProps } from '@/payload-types'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { getSiteLocale, localized } from '@/utilities/locale'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const icons = { award: Award, book: BookOpen, users: Users, target: Target }

export async function AboutTeacherBlock({ headingEn, headingSi, descriptionEn, descriptionSi, teacherImage, featureCards }: AboutTeacherBlockProps) {
  const locale = await getSiteLocale()

  let mediaResource = teacherImage
  if (mediaResource && (typeof mediaResource === 'number' || typeof mediaResource === 'string')) {
    try {
      const payload = await getPayload({ config: configPromise })
      mediaResource = await payload.findByID({
        collection: 'media',
        id: mediaResource,
      })
    } catch (e) {
      // Ignore
    }
  }

  return (
    <section className="container grid gap-12 py-20 lg:grid-cols-[.8fr_1.2fr]">
      <div>
        {mediaResource && typeof mediaResource === 'object' ? (
          <Media
            className="overflow-hidden rounded-3xl bg-blue-50"
            imgClassName="aspect-[4/5] w-full object-cover"
            preferredSize="large"
            resource={mediaResource}
            size="(max-width: 1024px) 100vw, 40vw"
          />
        ) : (
          <div className="aspect-[4/5] rounded-3xl bg-blue-50" />
        )}
      </div>
      <div className="self-center">
        <p className="section-kicker">Meet your teacher</p>
        <h2 className="section-title">{localized(locale, headingEn, headingSi)}</h2>
        <RichText className="mt-5 text-muted-foreground" data={locale === 'si' && descriptionSi ? descriptionSi : descriptionEn} enableGutter={false} />
        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          {featureCards?.map((card) => {
            const Icon = icons[card.icon || 'award']
            return (
              <article className="rounded-2xl border bg-white p-5 shadow-sm" key={card.id}>
                <Icon className="mb-3 size-7 text-gold-dark" aria-hidden />
                <h3 className="font-bold text-navy">{localized(locale, card.titleEn, card.titleSi)}</h3>
                {localized(locale, card.descriptionEn, card.descriptionSi) ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{localized(locale, card.descriptionEn, card.descriptionSi)}</p> : null}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

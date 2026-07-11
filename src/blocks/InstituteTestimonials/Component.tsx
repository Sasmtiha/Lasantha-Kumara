import configPromise from '@payload-config'
import { Quote, Star } from 'lucide-react'
import { getPayload } from 'payload'
import React from 'react'

import type { InstituteTestimonialsBlock as Props, Testimonial } from '@/payload-types'
import { LocalizedText } from '@/components/LocalizedText'

export async function InstituteTestimonialsBlock({ headingEn, headingSi, subtitleEn, subtitleSi, selectedTestimonials, showFeaturedOnly }: Props) {
  let testimonials: Testimonial[] = (selectedTestimonials || []).filter((item): item is Testimonial => typeof item === 'object')

  if (!testimonials.length) {
    const payload = await getPayload({ config: configPromise })
    testimonials = (await payload.find({
      collection: 'testimonials',
      limit: 12,
      pagination: false,
      sort: 'displayOrder',
      ...(showFeaturedOnly ? { where: { isFeatured: { equals: true } } } : {}),
    })).docs
  }

  return (
    <section className="bg-navy py-20 text-white">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-kicker text-gold">Success stories</p>
          <h2 className="section-title text-white">
            <LocalizedText english={headingEn} sinhala={headingSi} />
          </h2>
          {subtitleEn || subtitleSi ? (
            <p className="mt-4 text-blue-100">
              <LocalizedText english={subtitleEn} sinhala={subtitleSi} />
            </p>
          ) : null}
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <figure className="rounded-3xl border border-white/10 bg-white/5 p-7" key={item.id}>
              <Quote className="size-9 text-gold" aria-hidden />
              <div className="mt-5 flex gap-1" aria-label={`${item.rating} out of 5 stars`}>
                {Array.from({ length: item.rating }).map((_, index) => <Star className="size-4 fill-gold text-gold" key={index} />)}
              </div>
              <blockquote className="mt-5 leading-7 text-blue-50">
                “<LocalizedText english={item.feedbackEn} sinhala={item.feedbackSi} />”
              </blockquote>
              <figcaption className="mt-6 border-t border-white/10 pt-5"><strong>{item.name}</strong><span className="mt-1 block text-sm text-blue-200">{item.studentType}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

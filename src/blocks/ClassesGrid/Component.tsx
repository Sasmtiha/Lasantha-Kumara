import configPromise from '@payload-config'
import { ArrowRight, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { Class, ClassesGridBlock as ClassesGridBlockProps } from '@/payload-types'
import { LocalizedText } from '@/components/LocalizedText'

export async function ClassesGridBlock({ headingEn, headingSi, subtitleEn, subtitleSi, selectedClasses, showAllClasses }: ClassesGridBlockProps) {
  let classes: Class[] = (selectedClasses || []).filter((item): item is Class => typeof item === 'object')

  if (showAllClasses || !classes.length) {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'classes',
      limit: 12,
      pagination: false,
      sort: 'displayOrder',
      where: { isActive: { equals: true } },
    })
    classes = result.docs
  }

  return (
    <section className="bg-slate-50 py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-kicker">Classes</p>
          <h2 className="section-title">
            <LocalizedText english={headingEn} sinhala={headingSi} />
          </h2>
          {subtitleEn || subtitleSi ? (
            <p className="section-subtitle">
              <LocalizedText english={subtitleEn} sinhala={subtitleSi} />
            </p>
          ) : null}
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((course) => (
            <article className="group rounded-3xl border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg" key={course.id}>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-800">{course.category.replaceAll('_', ' ')}</span>
              <h3 className="mt-5 text-2xl font-bold text-navy">
                <LocalizedText english={course.titleEn} sinhala={course.titleSi} />
              </h3>
              {course.shortDescriptionEn || course.shortDescriptionSi ? (
                <p className="mt-3 min-h-20 leading-7 text-muted-foreground">
                  <LocalizedText english={course.shortDescriptionEn} sinhala={course.shortDescriptionSi} />
                </p>
              ) : null}
              <div className="mt-6 flex gap-5 border-t pt-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><Clock className="size-4" />{course.durationPerWeek}</span>
                {course.maxStudents ? <span className="flex items-center gap-2"><Users className="size-4" />Max {course.maxStudents}</span> : null}
              </div>
              <Link className="mt-6 inline-flex items-center gap-2 font-bold text-blue-800" href={`/classes/${course.slug}`}>
                View class <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

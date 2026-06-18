import configPromise from '@payload-config'
import { MapPin } from 'lucide-react'
import { getPayload } from 'payload'
import React from 'react'

import type { Schedule, ScheduleBlock as ScheduleBlockProps } from '@/payload-types'
import { getSiteLocale, localized } from '@/utilities/locale'

export async function ScheduleBlock({ headingEn, headingSi, subtitleEn, subtitleSi, selectedSchedules, showAllSchedules }: ScheduleBlockProps) {
  const locale = await getSiteLocale()
  let schedules: Schedule[] = (selectedSchedules || []).filter((item): item is Schedule => typeof item === 'object')

  if (showAllSchedules || !schedules.length) {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'schedules',
      depth: 1,
      limit: 50,
      pagination: false,
      sort: 'displayOrder',
      where: { isActive: { equals: true } },
    })
    schedules = result.docs
  }

  return (
    <section className="container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-kicker">Weekly timetable</p>
          <h2 className="section-title">{localized(locale, headingEn, headingSi)}</h2>
          {localized(locale, subtitleEn, subtitleSi) ? <p className="section-subtitle">{localized(locale, subtitleEn, subtitleSi)}</p> : null}
      </div>
      <div className="mt-12 hidden overflow-hidden rounded-2xl border md:block">
        <table className="w-full text-left">
          <thead className="bg-navy text-white"><tr><th className="p-4">Day</th><th className="p-4">Class</th><th className="p-4">Time</th><th className="p-4">Mode</th><th className="p-4">Location</th></tr></thead>
          <tbody>
            {schedules.map((item) => {
              const course = typeof item.class === 'object' ? item.class : null
              return <tr className="border-t even:bg-slate-50" key={item.id}><td className="p-4 font-semibold">{item.dayOfWeek}</td><td className="p-4 text-navy">{course ? localized(locale, course.titleEn, course.titleSi) : item.batchLabel}</td><td className="p-4">{item.startTime} – {item.endTime}</td><td className="p-4 capitalize">{item.mode}</td><td className="p-4">{item.location}</td></tr>
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-10 grid gap-4 md:hidden">
        {schedules.map((item) => {
          const course = typeof item.class === 'object' ? item.class : null
          return <article className="rounded-2xl border bg-white p-5 shadow-sm" key={item.id}><p className="text-sm font-bold uppercase tracking-wide text-blue-700">{item.dayOfWeek}</p><h3 className="mt-2 text-xl font-bold text-navy">{course ? localized(locale, course.titleEn, course.titleSi) : item.batchLabel}</h3><p className="mt-2">{item.startTime} – {item.endTime}</p><p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4" />{item.location} · {item.mode}</p></article>
        })}
      </div>
    </section>
  )
}

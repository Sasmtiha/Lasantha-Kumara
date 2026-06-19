import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { getPayload } from 'payload'

export const metadata: Metadata = {
  title: 'English Class Schedule | Lasantha Kumara',
  description: 'View the weekly timetable for Grade 6 to Grade 11 English classes.',
}

export default async function SchedulePage() {
  const payload = await getPayload({ config: configPromise })
  const schedules = await payload.find({ collection: 'schedules', depth: 1, pagination: false, sort: 'displayOrder', where: { isActive: { equals: true } } })
  return <main><section className="bg-[#034B9B] py-20 text-center text-white"><div className="container"><p className="section-kicker text-white/70">Weekly timetable</p><h1 className="text-4xl font-bold sm:text-5xl">Find a time that works for you</h1></div></section><section className="container py-16"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{schedules.docs.map((item) => { const course = typeof item.class === 'object' ? item.class : null; return <article className="rounded-md border bg-white p-6 shadow-sm" key={item.id}><p className="text-sm font-bold uppercase text-[#034EA2]">{item.dayOfWeek}</p><h2 className="mt-2 text-xl font-bold text-[#111827]">{course?.titleEn || item.batchLabel}</h2><p className="mt-3 text-lg">{item.startTime} – {item.endTime}</p><p className="mt-3 text-sm text-muted-foreground">{item.location} · <span className="capitalize">{item.mode}</span></p></article> })}</div></section></main>
}

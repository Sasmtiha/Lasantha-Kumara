import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { getPayload } from 'payload'

export const metadata: Metadata = {
  title: 'English Class Schedule | Lasantha Kumara',
  description: 'View the weekly timetable for English classes in Colombo, including O/L, A/L, spoken, grammar, and business English.',
}

export default async function SchedulePage() {
  const payload = await getPayload({ config: configPromise })
  const schedules = await payload.find({ collection: 'schedules', depth: 1, pagination: false, sort: 'displayOrder', where: { isActive: { equals: true } } })
  return <main><section className="bg-navy py-20 text-center text-white"><div className="container"><p className="section-kicker text-gold">Weekly timetable</p><h1 className="text-4xl font-bold sm:text-5xl">Find a time that works for you</h1></div></section><section className="container py-16"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{schedules.docs.map((item) => { const course = typeof item.class === 'object' ? item.class : null; return <article className="rounded-2xl border bg-white p-6 shadow-sm" key={item.id}><p className="text-sm font-bold uppercase text-blue-700">{item.dayOfWeek}</p><h2 className="mt-2 text-xl font-bold text-navy">{course?.titleEn || item.batchLabel}</h2><p className="mt-3 text-lg">{item.startTime} – {item.endTime}</p><p className="mt-3 text-sm text-muted-foreground">{item.location} · <span className="capitalize">{item.mode}</span></p></article> })}</div></section></main>
}

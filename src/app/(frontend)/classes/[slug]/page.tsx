import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import RichText from '@/components/RichText'

type Props = { params: Promise<{ slug: string }> }

async function getClass(slug: string) {
  const payload = await getPayload({ config: configPromise })
  return (await payload.find({ collection: 'classes', limit: 1, where: { and: [{ slug: { equals: slug } }, { isActive: { equals: true } }] } })).docs[0]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getClass((await params).slug)
  if (!course) return {}
  return {
    title: `${course.titleEn} | Lasantha Kumara English Classes`,
    description: course.shortDescriptionEn,
    alternates: { canonical: `/classes/${course.slug}` },
    openGraph: { title: course.titleEn, description: course.shortDescriptionEn },
  }
}

export default async function ClassDetailPage({ params }: Props) {
  const course = await getClass((await params).slug)
  if (!course) notFound()
  const payload = await getPayload({ config: configPromise })
  const schedules = await payload.find({ collection: 'schedules', pagination: false, sort: 'displayOrder', where: { and: [{ class: { equals: course.id } }, { isActive: { equals: true } }] } })

  return (
    <main>
      <section className="bg-navy py-20 text-white"><div className="container max-w-4xl"><p className="section-kicker text-gold">{course.category.replaceAll('_', ' ')} · {course.level}</p><h1 className="text-4xl font-bold sm:text-6xl">{course.titleEn}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">{course.shortDescriptionEn}</p><Link className="mt-8 inline-flex rounded-xl bg-gold px-6 py-3 font-bold text-navy" href={`/enroll?class=${course.id}`}>Enroll in this class</Link></div></section>
      <section className="container grid gap-12 py-16 lg:grid-cols-[1fr_22rem]"><div>{course.fullDescriptionEn ? <RichText data={course.fullDescriptionEn} enableGutter={false} /> : <p className="leading-8">{course.shortDescriptionEn}</p>}</div><aside className="rounded-3xl border bg-slate-50 p-6"><h2 className="text-xl font-bold text-navy">Class details</h2><dl className="mt-5 space-y-4"><div><dt className="text-sm text-muted-foreground">Duration</dt><dd className="font-semibold">{course.durationPerWeek}</dd></div><div><dt className="text-sm text-muted-foreground">Level</dt><dd className="font-semibold capitalize">{course.level}</dd></div><div><dt className="text-sm text-muted-foreground">Class size</dt><dd className="font-semibold">Up to {course.maxStudents || '—'} students</dd></div></dl></aside></section>
      {schedules.docs.length ? <section className="bg-slate-50 py-16"><div className="container"><h2 className="text-3xl font-bold text-navy">Available times</h2><div className="mt-7 grid gap-4 md:grid-cols-2">{schedules.docs.map((item) => <article className="rounded-2xl border bg-white p-5" key={item.id}><strong>{item.dayOfWeek}</strong><p className="mt-1">{item.startTime} – {item.endTime}</p><p className="mt-2 text-sm text-muted-foreground">{item.location} · {item.mode}</p></article>)}</div></div></section> : null}
    </main>
  )
}

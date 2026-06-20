import configPromise from '@payload-config'
import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
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
    title: `${course.titleEn} | IEM.lk`,
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
  const { user } = await payload.auth({ headers: await headers() })
  const enrollment =
    user?.role === 'student'
      ? (
          await payload.find({
            collection: 'enrollments',
            limit: 1,
            overrideAccess: true,
            sort: '-createdAt',
            where: {
              and: [
                { user: { equals: user.id } },
                { class: { equals: course.id } },
                { status: { in: ['pending', 'approved'] } },
              ],
            },
          })
        ).docs[0]
      : null

  const classAction = enrollment
    ? {
        href: '/student/dashboard',
        label: enrollment.status === 'approved' ? 'Open Student Portal' : 'Enrollment Pending',
      }
    : {
        href: `/enroll?class=${course.id}`,
        label: 'Enroll in this class',
      }

  return (
    <main className="pt-20">
      <section className="bg-[#034B9B] py-20 text-white"><div className="container max-w-4xl"><p className="section-kicker text-white/70">{course.category.replaceAll('_', ' ')} · {course.level}</p><h1 className="text-4xl font-bold sm:text-6xl">{course.titleEn}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">{course.shortDescriptionEn}</p><Link className="premium-button-light mt-8 inline-flex" href={classAction.href}>{classAction.label}</Link></div></section>
      <section className="container grid gap-12 py-16 lg:grid-cols-[1fr_22rem]"><div>{course.fullDescriptionEn ? <RichText data={course.fullDescriptionEn} enableGutter={false} /> : <p className="leading-8">{course.shortDescriptionEn}</p>}</div><aside className="rounded-md border bg-[#f4f4f2] p-6"><h2 className="text-xl font-bold text-[#111827]">Class details</h2><dl className="mt-5 space-y-4"><div><dt className="text-sm text-muted-foreground">Duration</dt><dd className="font-semibold">{course.durationPerWeek}</dd></div><div><dt className="text-sm text-muted-foreground">Level</dt><dd className="font-semibold capitalize">{course.level}</dd></div><div><dt className="text-sm text-muted-foreground">Class size</dt><dd className="font-semibold">Up to {course.maxStudents || '—'} students</dd></div></dl></aside></section>
      {schedules.docs.length ? <section className="bg-[#f4f4f2] py-16"><div className="container"><h2 className="text-3xl font-bold text-[#111827]">Available times</h2><div className="mt-7 grid gap-4 md:grid-cols-2">{schedules.docs.map((item) => <article className="rounded-md border bg-white p-5" key={item.id}><strong>{item.dayOfWeek}</strong><p className="mt-1">{item.startTime} – {item.endTime}</p><p className="mt-2 text-sm text-muted-foreground">{item.location} · {item.mode}</p></article>)}</div></div></section> : null}
    </main>
  )
}

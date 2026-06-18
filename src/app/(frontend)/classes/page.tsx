import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'

export const metadata: Metadata = {
  title: 'English Classes in Colombo | Lasantha Kumara',
  description: 'Explore spoken English, grammar, O/L, A/L, Grade 6–9, and Business English classes in Sri Lanka.',
}

export default async function ClassesPage() {
  const payload = await getPayload({ config: configPromise })
  const classes = await payload.find({ collection: 'classes', pagination: false, sort: 'displayOrder', where: { isActive: { equals: true } } })

  return (
    <main>
      <PageHero eyebrow="Find your class" title="English classes for every goal" description="Build confidence, improve exam results, and communicate clearly with focused guidance from an experienced teacher." />
      <section className="container grid gap-6 py-16 md:grid-cols-2 lg:grid-cols-3">
        {classes.docs.map((course) => <article className="rounded-3xl border bg-white p-7 shadow-sm" key={course.id}><p className="text-xs font-bold uppercase tracking-wider text-blue-700">{course.category.replaceAll('_', ' ')}</p><h2 className="mt-4 text-2xl font-bold text-navy">{course.titleEn}</h2><p className="mt-3 leading-7 text-muted-foreground">{course.shortDescriptionEn}</p><p className="mt-5 flex items-center gap-2 text-sm"><Clock className="size-4 text-gold-dark" />{course.durationPerWeek}</p><Link className="mt-6 inline-flex items-center gap-2 font-bold text-blue-800" href={`/classes/${course.slug}`}>View details <ArrowRight className="size-4" /></Link></article>)}
      </section>
    </main>
  )
}

function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="bg-navy py-20 text-white"><div className="container max-w-4xl text-center"><p className="section-kicker text-gold">{eyebrow}</p><h1 className="text-4xl font-bold sm:text-5xl">{title}</h1><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100">{description}</p></div></section>
}

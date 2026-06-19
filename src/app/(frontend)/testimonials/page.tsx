import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { Star } from 'lucide-react'
import { getPayload } from 'payload'

export const metadata: Metadata = {
  title: 'Student Success Stories | IEM.lk',
  description: 'Read feedback from students and parents who learned English with Lasantha Kumara.',
}

export default async function TestimonialsPage() {
  const payload = await getPayload({ config: configPromise })
  const testimonials = await payload.find({ collection: 'testimonials', pagination: false, sort: 'displayOrder' })
  return <main><section className="bg-[#034B9B] py-20 text-center text-white"><div className="container"><p className="section-kicker text-white/70">Success stories</p><h1 className="text-4xl font-bold sm:text-5xl">What our students and parents say</h1></div></section><section className="container grid gap-6 py-16 md:grid-cols-2 lg:grid-cols-3">{testimonials.docs.map((item) => <figure className="rounded-md border bg-white p-7 shadow-sm" key={item.id}><div className="flex gap-1">{Array.from({ length: item.rating }).map((_, index) => <Star className="size-4 fill-[#ed1c24] text-[#ed1c24]" key={index} />)}</div><blockquote className="mt-5 leading-7 text-muted-foreground">“{item.feedbackEn}”</blockquote><figcaption className="mt-6 border-t pt-5"><strong className="text-[#111827]">{item.name}</strong><span className="block text-sm text-muted-foreground">{item.studentType}</span></figcaption></figure>)}</section></main>
}

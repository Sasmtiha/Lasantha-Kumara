import React from 'react'
import type { FAQBlock as Props } from '@/payload-types'

export function FAQBlock({ heading, items }: Props) {
  return (
    <section className="container max-w-4xl py-20">
      <h2 className="section-title text-center">{heading}</h2>
      <div className="mt-10 space-y-3">
        {items.map((item) => <details className="rounded-2xl border bg-white p-5" key={item.id}><summary className="cursor-pointer font-bold text-navy">{item.questionEn}</summary><p className="mt-4 leading-7 text-muted-foreground">{item.answerEn}</p></details>)}
      </div>
    </section>
  )
}

'use client'

import React, { useState } from 'react'
import type { Class } from '@/payload-types'

export function ContactForm({ classes = [] }: { classes?: Class[] }) {
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('sending')
    const form = event.currentTarget
    const response = await fetch('/contact/submit', {
      body: new FormData(form),
      method: 'POST',
    })

    if (response.ok) {
      form.reset()
      setState('success')
    } else {
      setState('error')
    }
  }

  return (
    <form onSubmit={submit}>
      <input name="subject" type="hidden" value="Website enquiry" />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Full name" name="fullName" required />
        <FormField label="Email" name="email" required type="email" />
        <FormField label="Phone" name="phone" required type="tel" />
      </div>
      {classes.length ? (
        <label className="mt-5 block text-sm font-semibold text-[#111827]">
          Preferred class
          <select className="form-control mt-2" name="preferredClass">
            <option value="">Select a class (optional)</option>
            {classes.map((course) => (
              <option key={course.id} value={course.id}>
                {course.titleEn}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="mt-5 block text-sm font-semibold text-navy" htmlFor="contact-message">
        Message
        <textarea className="form-control mt-2 min-h-32" id="contact-message" name="message" required />
      </label>
      <button className="mt-6 w-full rounded-full bg-[#ffe600] px-5 py-3.5 font-black text-[#111827] shadow-sm transition hover:bg-[#f2c200] disabled:opacity-60" disabled={state === 'sending'} type="submit">
        {state === 'sending' ? 'Sending…' : 'Send'}
      </button>
      <p aria-live="polite" className="mt-4 text-sm">
        {state === 'success' ? 'Thank you. We will contact you shortly.' : null}
        {state === 'error' ? 'We could not send your message. Please try again.' : null}
      </p>
    </form>
  )
}

function FormField({ label, name, required, type = 'text' }: { label: string; name: string; required?: boolean; type?: string }) {
  return (
    <label className="block text-sm font-semibold text-navy">
      {label}
      <input className="form-control mt-2" name={name} required={required} type={type} />
    </label>
  )
}

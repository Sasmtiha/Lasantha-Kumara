'use client'

import { ArrowUpRight } from 'lucide-react'
import React, { useState } from 'react'
import type { Class } from '@/payload-types'

type ContactFormCopy = {
  emailLabel?: null | string
  errorMessage?: null | string
  fullNameLabel?: null | string
  messageLabel?: null | string
  phoneLabel?: null | string
  preferredClassLabel?: null | string
  preferredClassPlaceholder?: null | string
  submitLabel?: null | string
  successMessage?: null | string
}

export function ContactForm({
  classes = [],
  copy = {},
}: {
  classes?: Class[]
  copy?: ContactFormCopy
}) {
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
        <FormField label={copy.fullNameLabel || 'Full name'} name="fullName" required />
        <FormField label={copy.emailLabel || 'Email'} name="email" required type="email" />
        <FormField label={copy.phoneLabel || 'Phone'} name="phone" required type="tel" />
        {classes.length ? (
          <label className="block text-sm font-medium text-[#111827]">
            {copy.preferredClassLabel || 'Preferred class'}
            <select className="form-control mt-2" name="preferredClass">
              <option value="">
                {copy.preferredClassPlaceholder || 'Select a class (optional)'}
              </option>
              {classes.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.titleEn}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <label className="mt-5 block text-sm font-medium text-[#111827]" htmlFor="contact-message">
        {copy.messageLabel || 'Message'}
        <textarea className="form-control mt-2 min-h-32" id="contact-message" name="message" required />
      </label>
      <button className="premium-button-primary mt-6 w-full disabled:opacity-60" disabled={state === 'sending'} type="submit">
        {state === 'sending'
          ? 'Sending…'
          : <>{copy.submitLabel || 'Send Message'} <ArrowUpRight className="size-4" /></>}
      </button>
      <p aria-live="polite" className="mt-4 text-sm">
        {state === 'success'
          ? copy.successMessage || 'Thank you. We will contact you shortly.'
          : null}
        {state === 'error'
          ? copy.errorMessage || 'We could not send your message. Please try again.'
          : null}
      </p>
    </form>
  )
}

function FormField({ label, name, required, type = 'text' }: { label: string; name: string; required?: boolean; type?: string }) {
  return (
    <label className="block text-sm font-medium text-[#111827]">
      {label}
      <input className="form-control mt-2" name={name} required={required} type={type} />
    </label>
  )
}

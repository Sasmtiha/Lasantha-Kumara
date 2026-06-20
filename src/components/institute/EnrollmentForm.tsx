'use client'

import { useRouter } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

import type { Class } from '@/payload-types'

export function EnrollmentForm({ classes }: { classes: Class[] }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setError('')
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match.')
      setSending(false)
      return
    }

    const response = await fetch('/enroll/submit', {
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const result = (await response.json()) as { message?: string }

    if (!response.ok) {
      setError(result.message || 'Enrollment could not be submitted.')
      setSending(false)
      return
    }

    router.push('/login?enrolled=1')
  }

  return (
    <form onSubmit={submit}>
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        <Input label="First name" name="firstName" required />
        <Input label="Last name" name="lastName" required />
        <Input label="Email" name="email" required type="email" />
        <Input label="Phone" name="phone" required type="tel" />
        <Input label="Password" minLength={8} name="password" required type="password" />
        <Input label="Confirm password" minLength={8} name="confirmPassword" required type="password" />
        <label className="block text-sm font-medium text-[#4b4b54]">
          Grade
          <select className="auth-control mt-2" name="gradeLevel" required>
            <option value="">Select a grade</option>
            {[6, 7, 8, 9, 10, 11].map((grade) => (
              <option key={grade} value={`Grade ${grade}`}>Grade {grade}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-[#4b4b54]">
          Preferred class
          <select className="auth-control mt-2" name="preferredClass" required>
            <option value="">Select a class</option>
            {classes.map((course) => <option key={course.id} value={course.id}>{course.titleEn}</option>)}
          </select>
        </label>
        <Input label="Guardian name (optional)" name="guardianName" />
        <Input label="Guardian phone (optional)" name="guardianPhone" type="tel" />
      </div>
      <label className="mt-5 block text-sm font-medium text-[#4b4b54]">
        Anything we should know? (optional)
        <textarea className="auth-control mt-2 min-h-24 resize-y" name="message" />
      </label>
      <label className="mt-5 flex items-start gap-3 text-sm text-muted-foreground">
        <input className="mt-1 size-4" name="terms" required type="checkbox" value="accepted" />
        I confirm that the information is accurate and agree to be contacted about this enrollment.
      </label>
      {error ? <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p> : null}
      <button className="auth-button-primary mt-6 w-full disabled:opacity-60" disabled={sending} type="submit">
        {sending ? 'Submitting…' : <>Submit Enrollment <ArrowUpRight className="size-4" /></>}
      </button>
      <p className="mt-5 text-center text-sm text-[#73737d]">
        Already registered? <Link className="font-semibold text-[#034EA2] underline underline-offset-4" href="/login">Sign in</Link>
      </p>
    </form>
  )
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="block text-sm font-medium text-[#4b4b54]">{label}<input className="auth-control mt-2" {...props} /></label>
}

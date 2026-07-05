'use client'

import { KeyRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export function StudentPasswordChangeForm({ required, className }: { required?: boolean; className?: string }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    const response = await fetch('/student/profile/password', {
      body: JSON.stringify({
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword'),
        confirmPassword: formData.get('confirmPassword'),
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const result = (await response.json()) as { message?: string; success?: boolean }

    if (!response.ok || !result.success) {
      setError(result.message || 'Password could not be changed.')
      setSaving(false)
      return
    }

    form.reset()
    setSuccess('Password changed. You can continue using the student portal.')
    setSaving(false)
    router.refresh()
  }

  return (
    <section className={['max-w-4xl rounded-md border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,.06)] sm:p-8', className === undefined ? 'mt-8' : className].filter(Boolean).join(' ')}>
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-md bg-[#eef5ff] text-[#034EA2]">
          <KeyRound className="size-5" />
        </span>
        <div>
          <p className="premium-kicker text-[#034EA2]">Security</p>
          <h2 className="mt-2 text-2xl font-medium text-[#111827]">Change password</h2>
          <p className="mt-2 text-sm leading-6 text-[#6b7280]">
            {required
              ? 'Your account was created by the institute. Change the temporary password before continuing.'
              : 'Update your student portal password when needed.'}
          </p>
        </div>
      </div>

      <form className="mt-7 grid gap-5 sm:grid-cols-2" onSubmit={submit}>
        <label className="block text-sm font-medium text-[#4b4b54] sm:col-span-2">
          Current password
          <input
            autoComplete="current-password"
            className="auth-control mt-2"
            name="currentPassword"
            required
            type="password"
          />
        </label>
        <label className="block text-sm font-medium text-[#4b4b54]">
          New password
          <input
            autoComplete="new-password"
            className="auth-control mt-2"
            minLength={8}
            name="newPassword"
            required
            type="password"
          />
        </label>
        <label className="block text-sm font-medium text-[#4b4b54]">
          Confirm new password
          <input
            autoComplete="new-password"
            className="auth-control mt-2"
            minLength={8}
            name="confirmPassword"
            required
            type="password"
          />
        </label>
        {error ? <p className="text-sm text-red-700 sm:col-span-2" role="alert">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-700 sm:col-span-2" role="status">{success}</p> : null}
        <button className="premium-button-primary inline-flex w-fit disabled:opacity-60 sm:col-span-2" disabled={saving} type="submit">
          {saving ? 'Changing password...' : 'Change password'}
        </button>
      </form>
    </section>
  )
}

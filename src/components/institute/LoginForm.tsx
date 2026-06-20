'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setError('')
    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/users/login', {
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password'),
      }),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    const result = (await response.json()) as { user?: { role?: string }; errors?: { message?: string }[] }

    if (!response.ok || !result.user) {
      setError(result.errors?.[0]?.message || 'Email or password is incorrect.')
      setSending(false)
      return
    }

    if (result.user.role === 'student') router.push('/student/dashboard')
    else if (result.user.role === 'admin' || result.user.role === 'super_admin') router.push('/admin')
    else if (result.user.role === 'teacher') router.push('/teacher/dashboard')
    else router.push('/')
    router.refresh()
  }

  return (
    <form onSubmit={submit}>
      {searchParams.get('enrolled') ? <p className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">Enrollment submitted. Sign in to follow its approval status.</p> : null}
      <label className="block text-sm font-medium text-[#4b4b54]">Email<input autoComplete="email" className="auth-control mt-2" name="email" placeholder="you@example.com" required type="email" /></label>
      <label className="mt-5 block text-sm font-medium text-[#4b4b54]">Password<input autoComplete="current-password" className="auth-control mt-2" name="password" placeholder="Enter your password" required type="password" /></label>
      {error ? <p className="mt-4 text-sm text-red-700" role="alert">{error}</p> : null}
      <button className="auth-button-primary mt-6 w-full disabled:opacity-60" disabled={sending} type="submit">
        {sending ? 'Signing in…' : <>Log In <ArrowUpRight className="size-4" /></>}
      </button>
      <Link className="auth-button-secondary mt-4 flex w-full" href="/enroll">
        Register <ArrowUpRight className="size-4" />
      </Link>
    </form>
  )
}

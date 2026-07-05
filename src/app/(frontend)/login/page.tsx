import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { LoginForm } from '@/components/institute/LoginForm'
import { AuthSplitLayout } from '@/components/institute/AuthSplitLayout'
import { getMeUser } from '@/utilities/getMeUser'

export const metadata: Metadata = {
  title: 'Login | IEM',
  description: 'Sign in to your English class student portal.',
}

export default async function LoginPage() {
  const session = await getMeUser().catch(() => null)
  if (session?.user) {
    if (session.user.role === 'student') redirect('/student/dashboard')
    if (session.user.role === 'teacher') redirect('/teacher/dashboard')
    if (session.user.role === 'admin' || session.user.role === 'super_admin') redirect('/admin')
    redirect('/')
  }

  return (
    <AuthSplitLayout
      description="Sign in to your account and continue your learning journey."
      image="/login.png"
      title="Welcome to IEM"
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthSplitLayout>
  )
}

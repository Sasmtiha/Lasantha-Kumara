import type { Metadata } from 'next'

import { EnrollmentForm } from '@/components/institute/EnrollmentForm'
import { AuthSplitLayout } from '@/components/institute/AuthSplitLayout'

export const metadata: Metadata = {
  title: 'Register | IEM',
  description: 'Apply online for Grade 6 to Grade 11 English classes.',
}

export default async function EnrollPage() {
  return (
    <AuthSplitLayout
      description="Create your student account and submit your enrollment request."
      image="/register.png"
      title="Join IEM"
    >
      <EnrollmentForm />
    </AuthSplitLayout>
  )
}

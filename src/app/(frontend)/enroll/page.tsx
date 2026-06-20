import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { getPayload } from 'payload'

import { EnrollmentForm } from '@/components/institute/EnrollmentForm'
import { AuthSplitLayout } from '@/components/institute/AuthSplitLayout'

export const metadata: Metadata = {
  title: 'Register | IEM.lk',
  description: 'Apply online for Grade 6 to Grade 11 English classes.',
}

export default async function EnrollPage() {
  const payload = await getPayload({ config: configPromise })
  const classes = await payload.find({ collection: 'classes', pagination: false, sort: 'displayOrder', where: { isActive: { equals: true } } })

  return (
    <AuthSplitLayout
      description="Create your student account and submit your enrollment request."
      image="/register.png"
      title="Join IEM.lk"
    >
      <EnrollmentForm classes={classes.docs} />
    </AuthSplitLayout>
  )
}

import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { getPayload } from 'payload'

import { EnrollmentForm } from '@/components/institute/EnrollmentForm'
import { AuthSplitLayout } from '@/components/institute/AuthSplitLayout'

export const metadata: Metadata = {
  title: 'Register | IESM English Classes',
  description: 'Apply for English classes in Colombo. Register online for spoken, school, exam, and professional English courses.',
}

export default async function EnrollPage() {
  const payload = await getPayload({ config: configPromise })
  const classes = await payload.find({ collection: 'classes', pagination: false, sort: 'displayOrder', where: { isActive: { equals: true } } })

  return (
    <AuthSplitLayout
      description="Create your student account and submit your enrollment request."
      title="Join IESM"
    >
      <EnrollmentForm classes={classes.docs} />
    </AuthSplitLayout>
  )
}

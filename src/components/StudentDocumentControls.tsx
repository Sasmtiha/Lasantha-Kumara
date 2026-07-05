'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { ExternalLink, FilePlus2, GraduationCap } from 'lucide-react'
import { useEffect, useState } from 'react'

import './StudentDocumentControls.scss'

type EnrollmentSummary = {
  id: number | string
  status?: string
}

type StudentSummaryResponse = {
  enrollments?: EnrollmentSummary[]
}

const adminCollectionUrl = (slug: string, id?: number | string) =>
  `/admin/collections/${slug}${id ? `/${id}` : ''}`

export function StudentDocumentControls() {
  const { id } = useDocumentInfo()
  const [enrollmentId, setEnrollmentId] = useState<number | string | undefined>()

  useEffect(() => {
    if (!id) return

    let cancelled = false

    const loadEnrollment = async () => {
      const res = await fetch(`/api/students/${id}/admin-summary`, { credentials: 'include' })
      if (!res.ok) return

      const data = (await res.json()) as StudentSummaryResponse
      const activeEnrollment =
        data.enrollments?.find((item) => item.status === 'approved') || data.enrollments?.[0]

      if (!cancelled) {
        setEnrollmentId(activeEnrollment?.id)
      }
    }

    void loadEnrollment()

    return () => {
      cancelled = true
    }
  }, [id])

  if (!id) return null

  return (
    <div className="iem-student-doc-controls">
      {enrollmentId ? (
        <a href={adminCollectionUrl('enrollments', enrollmentId)}>
          <GraduationCap aria-hidden />
          <span>Current enrollment</span>
          <ExternalLink aria-hidden />
        </a>
      ) : null}
      <a href={`${adminCollectionUrl('student-marks')}/create?student=${id}`}>
        <FilePlus2 aria-hidden />
        <span>Record marks</span>
      </a>
    </div>
  )
}

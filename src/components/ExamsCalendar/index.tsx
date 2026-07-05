import type { AdminViewServerProps } from 'payload'
import React from 'react'

import ExamsCalendarClient, { type ExamCalendarEvent } from './ExamsCalendarClient'
import './index.scss'

const adminPath = '/admin'

const getClassTitle = (value: unknown) => {
  if (value && typeof value === 'object' && 'titleEn' in value) {
    return String(value.titleEn || 'Class')
  }

  return 'Class'
}

async function ExamsCalendar({ initPageResult }: AdminViewServerProps) {
  const payload = initPageResult.req.payload
  const exams = await payload.find({
    collection: 'exams',
    depth: 1,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    req: initPageResult.req,
    sort: 'examDate',
  })

  const events: ExamCalendarEvent[] = exams.docs
    .filter((exam) => exam.examDate)
    .map((exam) => ({
      className: getClassTitle(exam.class),
      editUrl: `${adminPath}/collections/exams/${exam.id}`,
      examType: exam.examType,
      gradeLevel: exam.gradeLevel,
      id: String(exam.id),
      isPublished: Boolean(exam.isPublished),
      start: exam.examDate,
      title: exam.title,
    }))

  return (
    <main className="iem-exams-calendar-view">
      <ExamsCalendarClient
        createUrl={`${adminPath}/collections/exams/create`}
        events={events}
        listUrl={`${adminPath}/collections/exams`}
      />
    </main>
  )
}

export default ExamsCalendar

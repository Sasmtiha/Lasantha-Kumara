'use client'

import React from 'react'
import { CalendarDays, List, Plus } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { AdminThemePreservingLink } from '@/components/AdminThemePreservingLink'
import { InlineCalendar } from './InlineCalendar'

import '@/components/ExamsCalendar/index.scss'
import './index.scss'

export default function ExamsCalendarListAction() {
  const searchParams = useSearchParams()
  const isCalendarView = searchParams?.get('view') === 'calendar'

  return (
    <>
      <div className="iem-exams-calendar-list-action">
        <AdminThemePreservingLink
          className="iem-exams-calendar-list-action__button"
          href={isCalendarView ? '/admin/collections/exams' : '/admin/collections/exams?view=calendar'}
        >
          {isCalendarView ? <List aria-hidden /> : <CalendarDays aria-hidden />}
          {isCalendarView ? 'List View' : 'Calendar View'}
        </AdminThemePreservingLink>
        <AdminThemePreservingLink
          className="iem-exams-calendar-list-action__button iem-exams-calendar-list-action__button--primary"
          href="/admin/collections/exams/create"
        >
          <Plus aria-hidden />
          Create Exam
        </AdminThemePreservingLink>
      </div>
      <InlineCalendar active={isCalendarView} />
    </>
  )
}

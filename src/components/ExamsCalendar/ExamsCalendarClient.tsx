'use client'

import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import type { EventClickArg, EventContentArg } from '@fullcalendar/core'
import { CalendarDays, List, Plus } from 'lucide-react'
import React, { useMemo } from 'react'

import { AdminThemePreservingLink } from '@/components/AdminThemePreservingLink'

export type ExamCalendarEvent = {
  className: string
  editUrl: string
  examType?: null | string
  gradeLevel?: null | string
  id: string
  isPublished: boolean
  start: string
  title: string
}

type ExamsCalendarClientProps = {
  createUrl: string
  events: ExamCalendarEvent[]
  initialView?: 'dayGridMonth' | 'listWeek' | 'timeGridDay' | 'timeGridWeek'
  listUrl: string
  showHeader?: boolean
  toolbarStyle?: 'agenda' | 'full'
}

const preserveTheme = () => {
  const theme = document.documentElement.getAttribute('data-theme')

  if (theme === 'dark' || theme === 'light') {
    window.localStorage.setItem('payload-theme', theme)
  }
}

const renderExamEvent = (eventInfo: EventContentArg) => {
  const { extendedProps } = eventInfo.event

  return (
    <span className="iem-exams-calendar-event">
      <span className="iem-exams-calendar-event__meta">
        {extendedProps.gradeLevel || 'Grade'} · {extendedProps.examType || 'Exam'}
      </span>
      <strong>{eventInfo.event.title}</strong>
      <small>{extendedProps.className}</small>
    </span>
  )
}

export default function ExamsCalendarClient({
  createUrl,
  events,
  initialView = 'dayGridMonth',
  listUrl,
  showHeader = true,
  toolbarStyle = 'full',
}: ExamsCalendarClientProps) {
  const calendarEvents = useMemo(
    () =>
      events.map((event) => ({
        allDay: false,
        backgroundColor: event.isPublished ? '#034ea2' : '#7c4dff',
        borderColor: event.isPublished ? '#034ea2' : '#7c4dff',
        classNames: [event.isPublished ? 'is-published' : 'is-draft'],
        extendedProps: {
          className: event.className,
          editUrl: event.editUrl,
          examType: event.examType,
          gradeLevel: event.gradeLevel,
          isPublished: event.isPublished,
        },
        id: event.id,
        start: event.start,
        title: event.title,
      })),
    [events],
  )

  const firstEventDate = calendarEvents[0]?.start

  const handleEventClick = (eventInfo: EventClickArg) => {
    const editUrl = eventInfo.event.extendedProps.editUrl

    if (typeof editUrl === 'string') {
      preserveTheme()
      window.location.href = editUrl
    }
  }

  return (
    <section className="iem-exams-calendar">
      {showHeader ? (
        <header className="iem-exams-calendar__header">
          <div>
            <p className="iem-exams-calendar__eyebrow">Academic Records</p>
            <h1>English Exams Calendar</h1>
            <span>Review scheduled exams by month, week, day, or agenda view.</span>
          </div>
          <div className="iem-exams-calendar__actions">
            <AdminThemePreservingLink className="iem-exams-calendar__button" href={listUrl}>
              <List aria-hidden />
              List View
            </AdminThemePreservingLink>
            <AdminThemePreservingLink
              className="iem-exams-calendar__button iem-exams-calendar__button--primary"
              href={createUrl}
            >
              <Plus aria-hidden />
              Create Exam
            </AdminThemePreservingLink>
          </div>
        </header>
      ) : null}

      <div className="iem-exams-calendar__shell">
        <div className="iem-exams-calendar__summary">
          <span>
            <CalendarDays aria-hidden />
            {events.length} scheduled exams
          </span>
          <span>{events.filter((event) => event.isPublished).length} published</span>
        </div>
        <FullCalendar
          buttonText={{
            day: 'Day',
            list: 'Agenda',
            month: 'Month',
            today: 'Today',
            week: 'Week',
          }}
          dayMaxEvents={3}
          eventClick={handleEventClick}
          eventContent={renderExamEvent}
          events={calendarEvents}
          firstDay={1}
          headerToolbar={
            toolbarStyle === 'agenda'
              ? {
                  center: 'title',
                  left: 'prev,next today',
                  right: '',
                }
              : {
                  center: 'title',
                  left: 'prev,next today',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                }
          }
          height="auto"
          initialDate={firstEventDate || undefined}
          initialView={initialView}
          nowIndicator
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
        />
      </div>
    </section>
  )
}

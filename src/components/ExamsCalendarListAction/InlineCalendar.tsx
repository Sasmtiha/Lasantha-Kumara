'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import ExamsCalendarClient, { type ExamCalendarEvent } from '@/components/ExamsCalendar/ExamsCalendarClient'

type PayloadExam = {
  class?: { titleEn?: string } | null | string
  examDate?: string | null
  examType?: null | string
  gradeLevel?: null | string
  id: number | string
  isPublished?: boolean | null
  title?: string | null
}

type PayloadResponse = {
  docs?: PayloadExam[]
}

const getClassTitle = (value: PayloadExam['class']) => {
  if (value && typeof value === 'object' && 'titleEn' in value) {
    return String(value.titleEn || 'Class')
  }

  return 'Class'
}

const toCalendarEvent = (exam: PayloadExam): ExamCalendarEvent | null => {
  if (!exam.examDate) return null

  return {
    className: getClassTitle(exam.class),
    editUrl: `/admin/collections/exams/${exam.id}`,
    examType: exam.examType,
    gradeLevel: exam.gradeLevel,
    id: String(exam.id),
    isPublished: Boolean(exam.isPublished),
    start: exam.examDate,
    title: exam.title || 'English Exam',
  }
}

export function InlineCalendar({ active }: { active: boolean }) {
  const [events, setEvents] = useState<ExamCalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLDivElement | null>(null)
  const loadStateRef = useRef<'idle' | 'loaded' | 'loading'>('idle')

  useEffect(() => {
    document.documentElement.classList.toggle('iem-exams-calendar-mode', active)

    return () => {
      document.documentElement.classList.remove('iem-exams-calendar-mode')
    }
  }, [active])

  useEffect(() => {
    if (!active) return

    const host = document.createElement('div')
    host.className = 'iem-exams-inline-calendar-host'

    const placeHost = () => {
      const listHeader = document.querySelector('.collection-list .list-header')
      const table = document.querySelector('.collection-list .table')
      const list = document.querySelector('.collection-list')

      if (listHeader?.parentElement) {
        listHeader.parentElement.insertBefore(host, listHeader.nextSibling)
        setPortalTarget(host)
        return true
      }

      if (table?.parentElement) {
        table.parentElement.insertBefore(host, table)
        setPortalTarget(host)
        return true
      }

      if (list) {
        list.appendChild(host)
        setPortalTarget(host)
        return true
      }

      return false
    }

    if (!placeHost()) {
      const timeout = window.setTimeout(placeHost, 100)

      return () => {
        window.clearTimeout(timeout)
        host.remove()
        setPortalTarget(null)
      }
    }

    return () => {
      host.remove()
      setPortalTarget(null)
    }
  }, [active])

  useEffect(() => {
    if (!active || loadStateRef.current !== 'idle') return

    loadStateRef.current = 'loading'
    setLoading(true)

    fetch('/api/exams?depth=1&limit=1000&sort=examDate', { credentials: 'same-origin' })
      .then((response) => response.json() as Promise<PayloadResponse>)
      .then((data) => {
        setEvents((data.docs || []).map(toCalendarEvent).filter(Boolean) as ExamCalendarEvent[])
      })
      .catch((error: unknown) => {
        console.error('Failed to load English exams calendar events', error)
        setEvents([])
      })
      .finally(() => {
        loadStateRef.current = 'loaded'
        setLoading(false)
      })
  }, [active])

  const content = useMemo(() => {
    if (!active) return null

    if (loading) {
      return <div className="iem-exams-inline-calendar__loading">Loading calendar...</div>
    }

    return (
      <ExamsCalendarClient
        createUrl="/admin/collections/exams/create"
        events={events}
        listUrl="/admin/collections/exams"
        showHeader={false}
      />
    )
  }, [active, events, loading])

  if (!active || !portalTarget) return null

  return createPortal(<div className="iem-exams-inline-calendar">{content}</div>, portalTarget)
}

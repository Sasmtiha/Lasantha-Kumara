import type { AdminViewServerProps, Where } from 'payload'
import React from 'react'

import { AdminThemePreservingLink } from '@/components/AdminThemePreservingLink'
import ExamsCalendarClient, { type ExamCalendarEvent } from '@/components/ExamsCalendar/ExamsCalendarClient'

import {
  LMSDashboardGradeTrendChart,
  LMSDashboardSparkline,
  type GradeTrendPoint,
} from './ChartsClient'
import LMSDashboardNotifications from './NotificationsClient'
import '@/components/ExamsCalendar/index.scss'
import './index.scss'

const adminPath = '/admin'

const collectionUrl = (slug: string, query?: string) =>
  `${adminPath}/collections/${slug}${query ? `?${query}` : ''}`

const formatDate = (value?: string | null) => {
  if (!value) return 'No date'

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

const formatNumber = (value: number) => new Intl.NumberFormat('en').format(value)

const getName = (item: { firstName?: string | null; fullName?: string | null; lastName?: string | null }) =>
  item.fullName || [item.firstName, item.lastName].filter(Boolean).join(' ') || 'Unnamed student'

const getClassTitle = (value: unknown) => {
  if (value && typeof value === 'object' && 'titleEn' in value) {
    return String(value.titleEn || 'Class')
  }

  return 'Class'
}

const gradeTrendKeys = [
  { key: 'grade6', label: 'Grade 6' },
  { key: 'grade7', label: 'Grade 7' },
  { key: 'grade8', label: 'Grade 8' },
  { key: 'grade9', label: 'Grade 9' },
  { key: 'grade10', label: 'Grade 10' },
  { key: 'grade11', label: 'Grade 11' },
] as const

const getGradeTrendKey = (grade?: null | string) =>
  gradeTrendKeys.find((item) => item.label === grade)?.key

async function LMSDashboard({ initPageResult }: AdminViewServerProps) {
  const payload = initPageResult.req.payload
  const monthStart = new Date()
  monthStart.setDate(monthStart.getDate() - 30)

  const countDocs = async (collection: any, where?: Where) => {
    const result = await payload.find({
      collection,
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: true,
      select: { id: true },
      where,
    })

    return result.totalDocs
  }

  const [
    totalStudents,
    activeStudents,
    newStudents,
    pendingStudents,
    paidStudents,
    unpaidStudents,
    activeTeachers,
    pendingEnrollments,
    approvedEnrollments,
    newMessages,
    publishedNotices,
    publishedResources,
    publishedExams,
    publishedResults,
    recentEnrollments,
    recentMessages,
    upcomingExams,
    recentMarks,
  ] = await Promise.all([
    countDocs('students'),
    countDocs('students', { enrollmentStatus: { equals: 'approved' } }),
    countDocs('students', { createdAt: { greater_than_equal: monthStart.toISOString() } }),
    countDocs('students', { enrollmentStatus: { equals: 'pending' } }),
    countDocs('students', { paymentStatus: { equals: 'paid' } }),
    countDocs('students', { paymentStatus: { equals: 'unpaid' } }),
    countDocs('teachers', { isActive: { equals: true } }),
    countDocs('enrollments', { status: { equals: 'pending' } }),
    countDocs('enrollments', { status: { equals: 'approved' } }),
    countDocs('contact-submissions', { status: { equals: 'new' } }),
    countDocs('notices', { isPublished: { equals: true } }),
    countDocs('resources', { isPublished: { equals: true } }),
    countDocs('exams', { isPublished: { equals: true } }),
    countDocs('student-marks', { isPublished: { equals: true } }),
    payload.find({
      collection: 'enrollments',
      depth: 1,
      limit: 5,
      overrideAccess: true,
      sort: '-createdAt',
      where: { status: { equals: 'pending' } },
    }),
    payload.find({
      collection: 'contact-submissions',
      depth: 1,
      limit: 4,
      overrideAccess: true,
      sort: '-createdAt',
      where: { status: { equals: 'new' } },
    }),
    payload.find({
      collection: 'exams',
      depth: 1,
      limit: 12,
      overrideAccess: true,
      sort: 'examDate',
      where: {
        examDate: {
          greater_than_equal: new Date().toISOString(),
        },
      },
    }),
    payload.find({
      collection: 'student-marks',
      depth: 1,
      limit: 120,
      overrideAccess: true,
      sort: 'examDate',
    }),
  ])

  const latestMarks = recentMarks.docs.slice(-8)
  const markPercentages = latestMarks.map((mark) => Number(mark.percentage || 0))
  const averageScore = latestMarks.length
    ? Math.round(
        latestMarks.reduce((total, mark) => total + Number(mark.percentage || 0), 0) /
          latestMarks.length,
      )
    : 0
  const passRate = latestMarks.length
    ? Math.round(
        (latestMarks.filter((mark) => mark.resultStatus === 'Pass').length / latestMarks.length) * 100,
      )
    : 0
  const enrollmentConversion = approvedEnrollments + pendingEnrollments
    ? Math.round((approvedEnrollments / (approvedEnrollments + pendingEnrollments)) * 100)
    : 0
  const sparklinePercentages = markPercentages.length ? markPercentages : [84, 75, 93, 80, 58, 72, 84]
  const performanceChartData = sparklinePercentages.map((score, index) => ({
    benchmark: 50,
    label:
      latestMarks[index]?.createdAt
        ? formatDate(latestMarks[index].createdAt)
        : `Point ${index + 1}`,
    score: Math.round(score),
  }))

  const marksByDate = new Map<string, Record<string, number[]>>()

  recentMarks.docs.forEach((mark) => {
    const trendKey = getGradeTrendKey(mark.gradeLevel)
    const dateValue = mark.examDate || mark.createdAt
    if (!trendKey || !dateValue) return

    const label = formatDate(dateValue)
    const dateBucket = marksByDate.get(label) || {}
    dateBucket[trendKey] = [...(dateBucket[trendKey] || []), Number(mark.percentage || 0)]
    marksByDate.set(label, dateBucket)
  })

  const gradeTrendData: GradeTrendPoint[] = Array.from(marksByDate.entries()).map(([label, values]) => {
    const point: GradeTrendPoint = { benchmark: 50, label }

    gradeTrendKeys.forEach((grade) => {
      const scores = values[grade.key]
      point[grade.key] = scores?.length
        ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
        : null
    })

    return point
  })

  const fallbackGradeTrendData: GradeTrendPoint[] = [
    { benchmark: 50, grade6: 80, grade7: 72, grade8: 68, grade9: 74, grade10: 70, grade11: 78, label: 'Point 1' },
    { benchmark: 50, grade6: 72, grade7: 76, grade8: 70, grade9: 68, grade10: 74, grade11: 80, label: 'Point 2' },
    { benchmark: 50, grade6: 88, grade7: 82, grade8: 76, grade9: 80, grade10: 72, grade11: 84, label: 'Point 3' },
    { benchmark: 50, grade6: 76, grade7: 86, grade8: 82, grade9: 73, grade10: 78, grade11: 79, label: 'Point 4' },
    { benchmark: 50, grade6: 58, grade7: 70, grade8: 75, grade9: 77, grade10: 82, grade11: 74, label: 'Point 5' },
    { benchmark: 50, grade6: 70, grade7: 78, grade8: 80, grade9: 84, grade10: 86, grade11: 82, label: 'Point 6' },
  ]

  const statCards = [
    {
      href: collectionUrl('students'),
      label: 'Total Students',
      note: `${formatNumber(newStudents)} new in 30 days`,
      value: totalStudents,
    },
    {
      href: collectionUrl('students', 'where[enrollmentStatus][equals]=approved'),
      label: 'Active Students',
      note: `${formatNumber(pendingStudents)} awaiting review`,
      value: activeStudents,
    },
    {
      href: collectionUrl('students', 'where[paymentStatus][equals]=paid'),
      label: 'Paid Students',
      note: `${formatNumber(unpaidStudents)} payment follow-ups`,
      value: paidStudents,
    },
    {
      href: collectionUrl('students', 'where[paymentStatus][equals]=unpaid'),
      label: 'Payments Due',
      note: 'Students marked unpaid',
      value: unpaidStudents,
    },
  ]

  const quickActions = [
    { href: collectionUrl('enrollments', 'where[status][equals]=pending'), label: 'Review Enrollments' },
    { href: collectionUrl('students', 'where[paymentStatus][equals]=unpaid'), label: 'Track Payments' },
    { href: `${collectionUrl('students')}/create`, label: 'Add Student' },
    { href: `${collectionUrl('exams')}/create`, label: 'Create Exam' },
    { href: `${collectionUrl('student-marks')}/create`, label: 'Record Marks' },
    { href: `${collectionUrl('notices')}/create`, label: 'Publish Notice' },
    { href: `${collectionUrl('resources')}/create`, label: 'Upload Resource' },
  ]

  const notificationMessages = recentMessages.docs.map((message) => ({
    createdAt: message.createdAt,
    href: `${collectionUrl('contact-submissions')}/${message.id}`,
    id: String(message.id),
    message: message.message,
    name: [message.firstName, message.lastName].filter(Boolean).join(' ') || 'Unknown sender',
    status: message.status,
    subject: message.subject,
  }))

  const agendaEvents: ExamCalendarEvent[] = upcomingExams.docs
    .filter((exam) => exam.examDate)
    .map((exam) => ({
      className: getClassTitle(exam.class),
      editUrl: `${collectionUrl('exams')}/${exam.id}`,
      examType: exam.examType,
      gradeLevel: exam.gradeLevel,
      id: String(exam.id),
      isPublished: Boolean(exam.isPublished),
      start: exam.examDate,
      title: exam.title,
    }))

  return (
    <main className="iem-lms-dashboard">
      <section className="iem-lms-welcome">
        <div>
          <p className="iem-lms-eyebrow">IEM Learning Management</p>
          <h1>Welcome back, Admin</h1>
          <span>
            Track admissions, academic performance, class operations, resources, and student
            communication.
          </span>
        </div>
        <div className="iem-lms-welcome__actions">
          <LMSDashboardNotifications count={newMessages} messages={notificationMessages} />
          <AdminThemePreservingLink className="iem-lms-export" href={collectionUrl('students')}>
            Student Records
          </AdminThemePreservingLink>
        </div>
      </section>

      <section className="iem-lms-overview">
        <article className="iem-lms-performance-card">
          <div className="iem-lms-performance-card__top">
            <p>Academic Performance</p>
            <AdminThemePreservingLink href={collectionUrl('student-marks')}>
              See more
            </AdminThemePreservingLink>
          </div>
          <strong>{averageScore || 0}%</strong>
          <span>Recent overall performance score</span>
          <div className="iem-lms-performance-card__footer">
            <span>{passRate || 0}% pass rate</span>
            <small>{formatNumber(publishedResults)} published result records</small>
          </div>
        </article>

        <section className="iem-lms-stat-grid" aria-label="Key LMS statistics">
          {statCards.map((card) => (
            <AdminThemePreservingLink className="iem-lms-stat-card" href={card.href} key={card.label}>
              <span>
                <small>{card.label}</small>
                <strong>{formatNumber(card.value)}</strong>
                <em>{card.note}</em>
              </span>
              <LMSDashboardSparkline data={performanceChartData} />
            </AdminThemePreservingLink>
          ))}
        </section>
      </section>

      <section className="iem-lms-main-grid">
        <article className="iem-lms-panel iem-lms-chart-panel">
          <div className="iem-lms-panel__header">
            <div>
              <p className="iem-lms-eyebrow">Analytics</p>
              <h2>Academic Progress Trend</h2>
            </div>
            <div className="iem-lms-legend">
              <span>Grade trends</span>
              <span>Pass benchmark</span>
            </div>
          </div>
          <div className="iem-lms-chart">
            <LMSDashboardGradeTrendChart
              data={gradeTrendData.length ? gradeTrendData : fallbackGradeTrendData}
            />
          </div>
        </article>

        <aside className="iem-lms-panel iem-lms-agenda-panel">
          <div className="iem-lms-panel__header">
            <div>
              <p className="iem-lms-eyebrow">Agenda</p>
              <h2>Upcoming Exams</h2>
            </div>
            <AdminThemePreservingLink href={collectionUrl('exams')}>
              Manage
            </AdminThemePreservingLink>
          </div>
          <div className="iem-lms-agenda iem-lms-agenda-calendar">
            <ExamsCalendarClient
              createUrl={`${collectionUrl('exams')}/create`}
              events={agendaEvents}
              initialView="listWeek"
              listUrl={collectionUrl('exams')}
              showHeader={false}
              toolbarStyle="agenda"
            />
          </div>
        </aside>
      </section>

      <section className="iem-lms-bottom-grid">
        <article className="iem-lms-panel">
          <div className="iem-lms-panel__header">
            <div>
              <p className="iem-lms-eyebrow">Admissions</p>
              <h2>Pending Enrollment Reviews</h2>
            </div>
            <AdminThemePreservingLink href={collectionUrl('enrollments', 'where[status][equals]=pending')}>
              View all
            </AdminThemePreservingLink>
          </div>
          <div className="iem-lms-list">
            {recentEnrollments.docs.length ? (
              recentEnrollments.docs.map((item) => (
                <AdminThemePreservingLink
                  className="iem-lms-list-item"
                  href={`${collectionUrl('enrollments')}/${item.id}`}
                  key={item.id}
                >
                  <span className="iem-lms-list-item__avatar">
                    {getName(item).slice(0, 1)}
                  </span>
                  <span>
                    <strong>{getName(item)}</strong>
                    <small>
                      {item.gradeLevel || 'Grade pending'} · {item.paymentStatus || 'unpaid'} · {formatDate(item.createdAt)}
                    </small>
                  </span>
                  <em>{item.status}</em>
                </AdminThemePreservingLink>
              ))
            ) : (
              <p className="iem-lms-empty">No enrollment reviews are waiting right now.</p>
            )}
          </div>
        </article>

        <article className="iem-lms-panel">
          <div className="iem-lms-panel__header">
            <div>
              <p className="iem-lms-eyebrow">Quick Access</p>
              <h2>Common LMS Workflows</h2>
            </div>
          </div>
          <div className="iem-lms-actions">
            {quickActions.map((action) => (
              <AdminThemePreservingLink href={action.href} key={action.label}>
                {action.label}
              </AdminThemePreservingLink>
            ))}
          </div>
        </article>
      </section>

      <section className="iem-lms-strip">
        <AdminThemePreservingLink href={collectionUrl('notices')}>
          {formatNumber(publishedNotices)} published notices
        </AdminThemePreservingLink>
        <AdminThemePreservingLink href={collectionUrl('resources')}>
          {formatNumber(publishedResources)} learning resources
        </AdminThemePreservingLink>
        <AdminThemePreservingLink href={collectionUrl('gallery')}>
          Gallery management
        </AdminThemePreservingLink>
        <AdminThemePreservingLink href={collectionUrl('pages')}>
          Website pages
        </AdminThemePreservingLink>
      </section>
    </main>
  )
}

export default LMSDashboard

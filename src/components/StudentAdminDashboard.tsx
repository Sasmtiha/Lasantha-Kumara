'use client'

import { useDocumentInfo, useForm } from '@payloadcms/ui'
import {
  AlertCircle,
  Award,
  BookOpenCheck,
  CreditCard,
  ExternalLink,
  FileCheck,
  FileText,
  FileX,
  GraduationCap,
  IdCard,
  Loader2,
  NotebookText,
  UserRound,
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import './StudentAdminDashboard.scss'

type RelationshipDoc = {
  id?: number | string
  title?: string
  titleEn?: string
}

type EnrollmentSummary = {
  id: number | string
  class?: number | string | RelationshipDoc
  createdAt?: string
  gradeLevel?: string
  paymentStatus?: string
  status?: string
}

type MarkSummary = {
  id: number | string
  exam?: RelationshipDoc
  examDate?: string
  letterGrade?: string
  marksObtained?: number
  percentage?: number
  resultStatus?: 'Pass' | 'Fail'
  totalMarks?: number
}

type SlipSummary = {
  id: number | string
  adminNotes?: string
  filename?: string
  month?: string
  status?: 'pending' | 'approved' | 'rejected'
  url?: string
}

type BillingHistoryItem = {
  expectedStatus: 'paid' | 'unpaid'
  monthName: string
  slip?: SlipSummary | null
}

type StudentSummary = {
  address?: string
  cardNumber?: string
  currentClasses?: Array<number | string | RelationshipDoc>
  email?: string
  enrollmentStatus?: string
  firstName?: string
  fullName?: string
  gradeLevel?: string
  guardianEmail?: string
  guardianName?: string
  guardianPhone?: string
  id: number | string
  lastName?: string
  notes?: string
  paymentStatus?: string
  phone?: string
  preferredClass?: number | string | RelationshipDoc
  school?: string
  user?: number | string | RelationshipDoc
}

type SummaryData = {
  billingHistory: BillingHistoryItem[]
  enrollments: EnrollmentSummary[]
  marks: MarkSummary[]
  slips: SlipSummary[]
  student: StudentSummary
}

type TabKey = 'overview' | 'payments' | 'marks' | 'enrollments'

interface StudentAdminDashboardProps {
  id?: number | string
}

const adminCollectionUrl = (slug: string, id?: number | string) =>
  `/admin/collections/${slug}${id ? `/${id}` : ''}`

const formatDate = (value?: string) => {
  if (!value) return 'No date'

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

const getRelationshipTitle = (value: unknown) => {
  if (value && typeof value === 'object') {
    const relation = value as RelationshipDoc
    return relation.titleEn || relation.title || 'Linked record'
  }

  return value ? `Record #${value}` : 'Not assigned'
}

const statusClass = (value?: string) => {
  if (['approved', 'paid', 'Pass', 'active'].includes(String(value))) return 'is-good'
  if (['pending', 'unpaid'].includes(String(value))) return 'is-waiting'
  if (['rejected', 'Fail', 'cancelled', 'inactive'].includes(String(value))) return 'is-bad'

  return ''
}

const getSlipHref = (slip: SlipSummary) => slip.url || (slip.filename ? `/media/${slip.filename}` : '')

const gradeOptions = [
  { label: 'Grade 6', value: 'Grade 6' },
  { label: 'Grade 7', value: 'Grade 7' },
  { label: 'Grade 8', value: 'Grade 8' },
  { label: 'Grade 9', value: 'Grade 9' },
  { label: 'Grade 10', value: 'Grade 10' },
  { label: 'Grade 11', value: 'Grade 11' },
]

export function StudentAdminDashboard({ id: propId }: StudentAdminDashboardProps) {
  const documentInfo = useDocumentInfo()
  const documentId = propId ?? documentInfo.id
  const id = documentId ? String(documentId) : ''
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState('')
  const [processingSlipId, setProcessingSlipId] = useState<string | null>(null)

  const { dispatchFields } = useForm()
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    gradeLevel: '',
    school: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    address: '',
  })

  // Populate local edit state when backend data loads or updates
  useEffect(() => {
    if (data?.student) {
      setEditData({
        firstName: data.student.firstName || '',
        lastName: data.student.lastName || '',
        phone: data.student.phone || '',
        email: data.student.email || '',
        gradeLevel: data.student.gradeLevel || '',
        school: data.student.school || '',
        guardianName: data.student.guardianName || '',
        guardianPhone: data.student.guardianPhone || '',
        guardianEmail: data.student.guardianEmail || '',
        address: data.student.address || '',
      })
    }
  }, [data])

  const handleInputChange = (field: string, value: unknown) => {
    setEditData((prev) => ({ ...prev, [field]: value }))
    dispatchFields({
      type: 'UPDATE',
      path: field,
      value: value,
    })
  }

  const fetchSummaryData = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError('')
      const res = await fetch(`/api/students/${id}/admin-summary`, { credentials: 'include' })
      const json = (await res.json()) as SummaryData & { error?: string; message?: string }

      if (!res.ok) {
        throw new Error(json.error || json.message || 'Failed to fetch student dashboard info.')
      }

      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [id])

  // Fetch summary on load, or when document is saved in Payload CMS (updatedAt changes)
  useEffect(() => {
    if (id) {
      void fetchSummaryData()
    }
  }, [id, fetchSummaryData, documentInfo?.lastUpdateTime])

  const tabs: { icon: React.ComponentType<{ 'aria-hidden'?: boolean }>; key: TabKey; label: string }[] = [
    { icon: UserRound, key: 'overview', label: 'Overview' },
    { icon: CreditCard, key: 'payments', label: 'Payments' },
    { icon: Award, key: 'marks', label: 'Marks' },
    { icon: GraduationCap, key: 'enrollments', label: 'Enrollments' },
  ]

  const handleUpdateStatus = async (slipId: number | string, status: 'approved' | 'rejected') => {
    try {
      setProcessingSlipId(String(slipId))
      const res = await fetch(`/api/payment-slips/${slipId}/update-status`, {
        body: JSON.stringify({ status }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const json = (await res.json()) as { error?: string; message?: string }

      if (!res.ok) {
        throw new Error(json.error || json.message || 'Failed to update payment status.')
      }

      await fetchSummaryData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating status.')
    } finally {
      setProcessingSlipId(null)
    }
  }

  if (!id) {
    return (
      <section className="iem-student-admin iem-student-admin--empty">
        <AlertCircle aria-hidden />
        <div>
          <h3>Save student first</h3>
          <p>After the student record is saved, this area will show payments, marks, enrollments, and notes.</p>
        </div>
      </section>
    )
  }

  if (loading && !data) {
    return (
      <section className="iem-student-admin iem-student-admin--loading">
        <Loader2 aria-hidden className="is-spinning" />
        <span>Loading student management file...</span>
      </section>
    )
  }

  if (error && !data) {
    return (
      <section className="iem-student-admin iem-student-admin--error">
        <AlertCircle aria-hidden />
        <div>
          <h3>Student file could not load</h3>
          <p>{error}</p>
          <button onClick={() => void fetchSummaryData()} type="button">
            Retry
          </button>
        </div>
      </section>
    )
  }

  const isFieldEditing = (field: string) => editingField === field
  const handleFieldClick = (field: string) => {
    setEditingField(field)
  }

  return (
    <section className="iem-student-admin">
      {error ? (
        <div className="iem-student-admin__inline-error">
          <AlertCircle aria-hidden />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="iem-student-admin__metrics">
        <MetricCard icon={IdCard} label="Card number" value={data?.student.cardNumber || 'Not assigned'} />
        <MetricCard
          icon={BookOpenCheck}
          label="Enrollment"
          status={data?.student.enrollmentStatus}
          value={data?.student.enrollmentStatus || 'Not enrolled'}
        />
        <MetricCard
          icon={CreditCard}
          label="Payment"
          status={data?.student.paymentStatus}
          value={data?.student.paymentStatus || 'unpaid'}
        />
      </div>

      <div className="iem-student-admin__tabs" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.key

          return (
            <button
              aria-selected={active}
              className={active ? 'is-active' : undefined}
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              role="tab"
              type="button"
            >
              <Icon aria-hidden />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {activeTab === 'overview' ? (
        <div className="iem-student-admin__content">
          <article className="iem-student-admin__details">
            <div className="iem-student-admin__section-header">
              <h3>Student details</h3>
            </div>
            <div className="iem-student-admin__detail-grid">
              <DetailItem
                label="First name"
                onClick={!isFieldEditing('firstName') ? () => handleFieldClick('firstName') : undefined}
              >
                {isFieldEditing('firstName') ? (
                  <InlineInput
                    className="iem-student-admin__input"
                    value={editData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    onDone={() => setEditingField(null)}
                  />
                ) : (
                  <strong>{editData.firstName || 'Click to set first name'}</strong>
                )}
              </DetailItem>
              <DetailItem
                label="Last name"
                onClick={!isFieldEditing('lastName') ? () => handleFieldClick('lastName') : undefined}
              >
                {isFieldEditing('lastName') ? (
                  <InlineInput
                    className="iem-student-admin__input"
                    value={editData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    onDone={() => setEditingField(null)}
                  />
                ) : (
                  <strong>{editData.lastName || 'Click to set last name'}</strong>
                )}
              </DetailItem>
              <DetailItem
                label="Phone"
                onClick={!data?.student.phone && !isFieldEditing('phone') ? () => handleFieldClick('phone') : undefined}
              >
                {isFieldEditing('phone') ? (
                  <InlineInput
                    className="iem-student-admin__input"
                    value={editData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    onDone={() => setEditingField(null)}
                  />
                ) : (
                  <strong>{editData.phone || 'No phone'}</strong>
                )}
              </DetailItem>
              <DetailItem
                label="Email"
                onClick={!data?.student.email && !isFieldEditing('email') ? () => handleFieldClick('email') : undefined}
              >
                {isFieldEditing('email') ? (
                  <InlineInput
                    type="email"
                    className="iem-student-admin__input"
                    value={editData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onDone={() => setEditingField(null)}
                  />
                ) : (
                  <strong>{editData.email || 'No email'}</strong>
                )}
              </DetailItem>
              <DetailItem
                label="Grade"
                onClick={!isFieldEditing('gradeLevel') ? () => handleFieldClick('gradeLevel') : undefined}
              >
                {isFieldEditing('gradeLevel') ? (
                  <InlineSelect
                    className="iem-student-admin__select"
                    value={editData.gradeLevel}
                    onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                    onDone={() => setEditingField(null)}
                  >
                    <option value="">Select Grade</option>
                    {gradeOptions.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </InlineSelect>
                ) : (
                  <strong>{editData.gradeLevel || 'No grade'}</strong>
                )}
              </DetailItem>
              <DetailItem
                label="School"
                onClick={!isFieldEditing('school') ? () => handleFieldClick('school') : undefined}
              >
                {isFieldEditing('school') ? (
                  <InlineInput
                    className="iem-student-admin__input"
                    value={editData.school}
                    onChange={(e) => handleInputChange('school', e.target.value)}
                    onDone={() => setEditingField(null)}
                  />
                ) : (
                  <strong>{editData.school || 'No school'}</strong>
                )}
              </DetailItem>
              <DetailItem
                label="Guardian"
                onClick={!isFieldEditing('guardianName') ? () => handleFieldClick('guardianName') : undefined}
              >
                {isFieldEditing('guardianName') ? (
                  <InlineInput
                    className="iem-student-admin__input"
                    value={editData.guardianName}
                    onChange={(e) => handleInputChange('guardianName', e.target.value)}
                    onDone={() => setEditingField(null)}
                  />
                ) : (
                  <strong>{editData.guardianName || 'No guardian'}</strong>
                )}
              </DetailItem>
              <DetailItem
                label="Guardian phone"
                onClick={!isFieldEditing('guardianPhone') ? () => handleFieldClick('guardianPhone') : undefined}
              >
                {isFieldEditing('guardianPhone') ? (
                  <InlineInput
                    className="iem-student-admin__input"
                    value={editData.guardianPhone}
                    onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                    onDone={() => setEditingField(null)}
                  />
                ) : (
                  <strong>{editData.guardianPhone || 'No guardian phone'}</strong>
                )}
              </DetailItem>
              <DetailItem
                label="Guardian email"
                onClick={!isFieldEditing('guardianEmail') ? () => handleFieldClick('guardianEmail') : undefined}
              >
                {isFieldEditing('guardianEmail') ? (
                  <InlineInput
                    type="email"
                    className="iem-student-admin__input"
                    value={editData.guardianEmail}
                    onChange={(e) => handleInputChange('guardianEmail', e.target.value)}
                    onDone={() => setEditingField(null)}
                  />
                ) : (
                  <strong>{editData.guardianEmail || 'No guardian email'}</strong>
                )}
              </DetailItem>
              <DetailItem
                className="iem-student-admin__detail-item--span-3"
                label="Address"
                onClick={!isFieldEditing('address') ? () => handleFieldClick('address') : undefined}
              >
                {isFieldEditing('address') ? (
                  <InlineTextarea
                    className="iem-student-admin__input iem-student-admin__textarea"
                    value={editData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    onDone={() => setEditingField(null)}
                  />
                ) : (
                  <strong>{editData.address || 'No address'}</strong>
                )}
              </DetailItem>
            </div>
          </article>

          <div className="iem-student-admin__overview-grid">
            <article>
              <div className="iem-student-admin__section-header">
                <h3>Admin notes</h3>
              </div>
              <div className="iem-student-admin__notes">
                <NotebookText aria-hidden />
                <p>{data?.student.notes || 'No internal notes have been added for this student.'}</p>
              </div>
            </article>
          </div>

          <div className="iem-student-admin__actions">
            <a href={adminCollectionUrl('enrollments')} className="iem-student-admin__actions-btn--size-save">Review enrollments</a>
            <a href={adminCollectionUrl('payment-slips')}>Review payment slips</a>
            <a href={`${adminCollectionUrl('student-marks')}/create`} className="iem-student-admin__actions-btn--size-save">Record new marks</a>
            <a href={`${adminCollectionUrl('exams')}/create`}>Create exam</a>
          </div>
        </div>
      ) : null}

      {activeTab === 'payments' ? (
        <div className="iem-student-admin__content">
          <div className="iem-student-admin__section-header">
            <h3>Payment timeline</h3>
            <a href={adminCollectionUrl('payment-slips')}>Open payment slips</a>
          </div>
          <div className="iem-student-admin__timeline">
            {data?.billingHistory.length ? (
              data.billingHistory.map((item) => (
                <div className="iem-student-admin__timeline-item" key={item.monthName}>
                  <span className={`iem-student-admin__dot ${statusClass(item.slip?.status || item.expectedStatus)}`} />
                  <div>
                    <strong>{item.monthName}</strong>
                    <small className={statusClass(item.expectedStatus)}>Expected: {item.expectedStatus}</small>
                  </div>
                  <PaymentSlipActions
                    disabled={processingSlipId !== null}
                    onStatusChange={handleUpdateStatus}
                    processingSlipId={processingSlipId}
                    slip={item.slip}
                  />
                </div>
              ))
            ) : (
              <p className="iem-student-admin__empty">No payment timeline has been generated.</p>
            )}
          </div>
        </div>
      ) : null}

      {activeTab === 'marks' ? (
        <div className="iem-student-admin__content">
          <div className="iem-student-admin__section-header">
            <h3>Academic marks</h3>
            <a href={`${adminCollectionUrl('student-marks')}/create`}>Record marks</a>
          </div>
          <div className="iem-student-admin__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Date</th>
                  <th>Marks</th>
                  <th>Grade</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {data?.marks.length ? (
                  data.marks.map((mark) => (
                    <tr key={mark.id}>
                      <td>
                        <a href={adminCollectionUrl('student-marks', mark.id)}>
                          {getRelationshipTitle(mark.exam)}
                        </a>
                      </td>
                      <td>{formatDate(mark.examDate)}</td>
                      <td>
                        {mark.marksObtained ?? '-'} / {mark.totalMarks ?? '-'} ·{' '}
                        {Math.round(Number(mark.percentage || 0))}%
                      </td>
                      <td>{mark.letterGrade || '-'}</td>
                      <td><span className={statusClass(mark.resultStatus)}>{mark.resultStatus || '-'}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>No exam marks recorded for this student.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === 'enrollments' ? (
        <div className="iem-student-admin__content">
          <div className="iem-student-admin__section-header">
            <h3>Enrollment history</h3>
            <a href={`${adminCollectionUrl('enrollments')}/create`}>Create enrollment</a>
          </div>
          <div className="iem-student-admin__mini-list">
            {data?.enrollments.length ? (
              data.enrollments.map((enrollment) => (
                <a href={adminCollectionUrl('enrollments', enrollment.id)} key={enrollment.id}>
                  <span>
                    <strong>{getRelationshipTitle(enrollment.class)}</strong>
                    <small>{enrollment.gradeLevel || 'Grade not set'} · {formatDate(enrollment.createdAt)}</small>
                  </span>
                  <em className={statusClass(enrollment.status)}>{enrollment.status || 'pending'}</em>
                </a>
              ))
            ) : (
              <p className="iem-student-admin__empty">No enrollment records are linked to this student.</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function MetricCard({
  icon: Icon,
  label,
  status,
  value,
}: {
  icon: React.ComponentType<{ 'aria-hidden'?: boolean }>
  label: string
  status?: string
  value: string
}) {
  return (
    <article className="iem-student-admin__metric">
      <Icon aria-hidden />
      <span>{label}</span>
      <strong className={statusClass(status)}>{value}</strong>
    </article>
  )
}

function DetailItem({
  label,
  value,
  onClick,
  className,
  children,
}: {
  label: string
  value?: string
  onClick?: () => void
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={`iem-student-admin__detail-item ${onClick ? 'is-clickable' : ''} ${className || ''}`}
      onClick={onClick}
    >
      <span>{label}</span>
      {children ? children : <strong>{value}</strong>}
    </div>
  )
}

interface InlineInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onDone: () => void
}

function InlineInput({ onDone, ...props }: InlineInputProps) {
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <input
      ref={ref}
      onBlur={onDone}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onDone()
        }
      }}
      {...props}
    />
  )
}

interface InlineTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onDone: () => void
}

function InlineTextarea({ onDone, ...props }: InlineTextareaProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null)
  React.useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <textarea
      ref={ref}
      onBlur={onDone}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          onDone()
        }
      }}
      {...props}
    />
  )
}

interface InlineSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onDone: () => void
}

function InlineSelect({ onDone, ...props }: InlineSelectProps) {
  const ref = React.useRef<HTMLSelectElement>(null)
  React.useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <select
      ref={ref}
      onBlur={onDone}
      onChange={(e) => {
        props.onChange?.(e)
        onDone()
      }}
      {...props}
    />
  )
}

function PaymentSlipActions({
  disabled,
  onStatusChange,
  processingSlipId,
  slip,
}: {
  disabled: boolean
  onStatusChange: (id: number | string, status: 'approved' | 'rejected') => Promise<void>
  processingSlipId: string | null
  slip?: SlipSummary | null
}) {
  if (!slip) {
    return <span className="iem-student-admin__muted">No slip uploaded</span>
  }

  const href = getSlipHref(slip)
  const isProcessing = processingSlipId === String(slip.id)

  return (
    <div className="iem-student-admin__slip-actions">
      {href ? (
        <a href={href} rel="noreferrer" target="_blank">
          <FileText aria-hidden />
          View slip
          <ExternalLink aria-hidden />
        </a>
      ) : null}
      <span className={statusClass(slip.status)}>{slip.status || 'pending'}</span>
      {slip.status === 'pending' ? (
        <div>
          <button
            disabled={disabled}
            onClick={() => void onStatusChange(slip.id, 'approved')}
            type="button"
          >
            {isProcessing ? <Loader2 aria-hidden className="is-spinning" /> : <FileCheck aria-hidden />}
            Approve
          </button>
          <button
            disabled={disabled}
            onClick={() => void onStatusChange(slip.id, 'rejected')}
            type="button"
          >
            <FileX aria-hidden />
            Reject
          </button>
        </div>
      ) : null}
    </div>
  )
}

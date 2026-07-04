import type { BeforeListServerProps, Where } from 'payload'

import LMSListFiltersClient, { type LMSListFilterConfig } from './ListFiltersClient'
import './index.scss'

const gradeOptions = [
  { label: 'Grade 6', value: 'Grade 6' },
  { label: 'Grade 7', value: 'Grade 7' },
  { label: 'Grade 8', value: 'Grade 8' },
  { label: 'Grade 9', value: 'Grade 9' },
  { label: 'Grade 10', value: 'Grade 10' },
  { label: 'Grade 11', value: 'Grade 11' },
]

const classGradeOptions = [
  { label: 'Grade 6', value: 'grade_6' },
  { label: 'Grade 7', value: 'grade_7' },
  { label: 'Grade 8', value: 'grade_8' },
  { label: 'Grade 9', value: 'grade_9' },
  { label: 'Grade 10', value: 'grade_10' },
  { label: 'Grade 11', value: 'grade_11' },
]

const booleanStatusTabs = [
  { label: 'Published', value: 'true' },
  { label: 'Draft', value: 'false' },
]

const activeTabs = [
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
]

const paymentTabs = [
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Paid', value: 'paid' },
]

const gradeTabConfig = {
  hideStatusTabCounts: true,
  statusTabs: gradeOptions,
}

const classGradeTabConfig = {
  hideStatusTabCounts: true,
  statusTabs: classGradeOptions,
}

const configs: Record<string, LMSListFilterConfig> = {
  classes: {
    fields: [
      {
        label: 'Category',
        name: 'category',
        options: classGradeOptions,
      },
      {
        label: 'Level',
        name: 'level',
        options: ['beginner', 'intermediate', 'exam'].map((value) => ({ label: value, value })),
      },
      {
        label: 'Status',
        name: 'isActive',
        options: activeTabs,
      },
    ],
    statusField: 'category',
    ...classGradeTabConfig,
  },
  'contact-submissions': {
    fields: [
      {
        label: 'Status',
        name: 'status',
        options: ['new', 'read', 'replied', 'archived'].map((value) => ({ label: value, value })),
      },
    ],
    statusField: undefined,
    statusTabs: undefined,
  },
  enrollments: {
    fields: [
      {
        label: 'Status',
        name: 'status',
        options: ['pending', 'approved', 'rejected', 'cancelled'].map((value) => ({
          label: value,
          value,
        })),
      },
      { label: 'Grade', name: 'gradeLevel', options: gradeOptions },
      { label: 'Payment', name: 'paymentStatus', options: paymentTabs },
    ],
    statusField: 'gradeLevel',
    ...gradeTabConfig,
  },
  exams: {
    fields: [
      { label: 'Grade', name: 'gradeLevel', options: gradeOptions },
      {
        label: 'Exam type',
        name: 'examType',
        options: ['Unit Test', 'Monthly Test', 'Term Test', 'Mock Exam', 'Final Exam'].map((value) => ({
          label: value,
          value,
        })),
      },
      { label: 'Publication', name: 'isPublished', options: booleanStatusTabs },
    ],
    statusField: 'gradeLevel',
    ...gradeTabConfig,
  },
  gallery: {
    fields: [
      {
        label: 'Category',
        name: 'category',
        options: ['Classes', 'Events', 'Student Life', 'Achievements'].map((value) => ({
          label: value,
          value,
        })),
      },
      { label: 'Publication', name: 'isPublished', options: booleanStatusTabs },
    ],
    statusField: undefined,
    statusTabs: undefined,
  },
  notices: {
    fields: [
      {
        label: 'Priority',
        name: 'priority',
        options: ['normal', 'important', 'urgent'].map((value) => ({ label: value, value })),
      },
      {
        label: 'Audience',
        name: 'targetType',
        options: ['all', 'class', 'grade', 'student'].map((value) => ({ label: value, value })),
      },
      { label: 'Publication', name: 'isPublished', options: booleanStatusTabs },
    ],
    statusField: 'gradeLevel',
    ...gradeTabConfig,
  },
  resources: {
    fields: [
      {
        label: 'Type',
        name: 'resourceType',
        options: ['pdf', 'document', 'video', 'link', 'image'].map((value) => ({
          label: value,
          value,
        })),
      },
      {
        label: 'Visibility',
        name: 'visibility',
        options: ['public', 'enrolled_students', 'admins_only'].map((value) => ({
          label: value,
          value,
        })),
      },
      { label: 'Publication', name: 'isPublished', options: booleanStatusTabs },
    ],
    statusField: undefined,
    statusTabs: undefined,
  },
  schedules: {
    fields: [
      {
        label: 'Mode',
        name: 'mode',
        options: ['physical', 'online', 'hybrid'].map((value) => ({ label: value, value })),
      },
      { label: 'Status', name: 'isActive', options: activeTabs },
    ],
    statusField: undefined,
    statusTabs: undefined,
  },
  'student-marks': {
    fields: [
      { label: 'Grade', name: 'gradeLevel', options: gradeOptions },
      {
        label: 'Result',
        name: 'resultStatus',
        options: ['Pass', 'Fail'].map((value) => ({ label: value, value })),
      },
      { label: 'Publication', name: 'isPublished', options: booleanStatusTabs },
    ],
    statusField: 'gradeLevel',
    ...gradeTabConfig,
  },
  students: {
    fields: [
      {
        label: 'Status',
        name: 'enrollmentStatus',
        options: ['pending', 'approved', 'rejected', 'inactive'].map((value) => ({
          label: value,
          value,
        })),
        },
        { label: 'Grade', name: 'gradeLevel', options: gradeOptions },
        { label: 'Payment', name: 'paymentStatus', options: paymentTabs },
      ],
    statusField: 'gradeLevel',
    ...gradeTabConfig,
  },
  teachers: {
    fields: [{ label: 'Status', name: 'isActive', options: activeTabs }],
    statusField: undefined,
    statusTabs: undefined,
  },
  users: {
    fields: [
      {
        label: 'Status',
        name: 'status',
        options: ['active', 'inactive', 'suspended'].map((value) => ({ label: value, value })),
      },
      {
        label: 'Role',
        name: 'role',
        options: ['super_admin', 'admin', 'teacher', 'student'].map((value) => ({
          label: value.replaceAll('_', ' '),
          value,
        })),
      },
    ],
    statusField: undefined,
    statusTabs: undefined,
  },
}

const defaultConfig: LMSListFilterConfig = {
  fields: [],
}

type AdminFilterField = LMSListFilterConfig['fields'][number]
type FieldLike = {
  admin?: {
    hidden?: boolean
  }
  fields?: FieldLike[]
  label?: unknown
  labels?: {
    singular?: unknown
  }
  name?: string
  options?: Array<string | { label?: unknown; value: string }>
  tabs?: Array<{ fields?: FieldLike[] }>
  type?: string
}

const getLabelText = (label: unknown, fallback: string) => {
  if (typeof label === 'string') return label
  if (label && typeof label === 'object') {
    const localized = Object.values(label as Record<string, unknown>).find(
      (value) => typeof value === 'string',
    )

    if (typeof localized === 'string') return localized
  }

  return fallback
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const normalizeOption = (option: string | { label?: unknown; value: string }) => {
  if (typeof option === 'string') {
    return {
      label: option,
      value: option,
    }
  }

  return {
    label: getLabelText(option.label, option.value),
    value: option.value,
  }
}

const flattenFields = (fields: FieldLike[] = []): FieldLike[] =>
  fields.flatMap((field) => {
    const nestedFields = [
      ...(field.fields ? flattenFields(field.fields) : []),
      ...(field.tabs?.flatMap((tab) => flattenFields(tab.fields || [])) || []),
    ]

    return field.name ? [field, ...nestedFields] : nestedFields
  })

const getGeneratedFilterFields = (fields: FieldLike[] = []): AdminFilterField[] =>
  flattenFields(fields)
    .filter((field) => field.name && !field.admin?.hidden)
    .flatMap((field) => {
      if ((field.type === 'select' || field.type === 'radio') && field.options?.length) {
        return [
          {
            label: getLabelText(field.label || field.labels?.singular, field.name as string),
            name: field.name as string,
            options: field.options.map(normalizeOption),
          },
        ]
      }

      if (field.type === 'checkbox') {
        return [
          {
            label: getLabelText(field.label || field.labels?.singular, field.name as string),
            name: field.name as string,
            options: activeTabs,
          },
        ]
      }

      return []
    })

const mergeFilterFields = (fields: AdminFilterField[]) => {
  const merged = new Map<string, AdminFilterField>()

  fields.forEach((field) => {
    if (!merged.has(field.name)) {
      merged.set(field.name, field)
    }
  })

  return Array.from(merged.values())
}

const normalizeWhereValue = (value: string) => {
  if (value === 'true') return true
  if (value === 'false') return false

  return value
}

async function getStatusCounts({
  collectionSlug,
  config,
  payload,
}: {
  collectionSlug: string
  config: LMSListFilterConfig
  payload: BeforeListServerProps['payload']
}) {
  if (!config.statusField || !config.statusTabs?.length || config.hideStatusTabCounts) return undefined

  const all = await payload.find({
    collection: collectionSlug as any,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: true,
    select: { id: true },
  })

  const entries = await Promise.all(
    config.statusTabs.map(async (tab) => {
      const where: Where = {
        [config.statusField as string]: {
          equals: normalizeWhereValue(tab.value),
        },
      }

      const result = await payload.find({
        collection: collectionSlug as any,
        depth: 0,
        limit: 1,
        overrideAccess: true,
        pagination: true,
        select: { id: true },
        where,
      })

      return [tab.value, result.totalDocs] as const
    }),
  )

  return {
    all: all.totalDocs,
    byValue: Object.fromEntries(entries),
  }
}

export default async function LMSListFilters(props: BeforeListServerProps) {
  const collectionSlug = props.collectionSlug
  const manualConfig = configs[collectionSlug] || defaultConfig
  const config: LMSListFilterConfig = {
    ...manualConfig,
    fields: mergeFilterFields([
      ...manualConfig.fields,
      ...getGeneratedFilterFields(props.collectionConfig.fields as FieldLike[]),
    ]),
  }
  const counts = await getStatusCounts({
    collectionSlug,
    config,
    payload: props.payload,
  })

  return (
    <LMSListFiltersClient
      collectionLabel={String(props.collectionConfig.labels.plural || collectionSlug)}
      collectionSlug={collectionSlug}
      config={config}
      counts={counts}
    />
  )
}

import type { Block } from 'payload'

export const Schedule: Block = {
  slug: 'schedule',
  interfaceName: 'ScheduleBlock',
  fields: [
    { name: 'headingEn', type: 'text', required: true },
    { name: 'headingSi', type: 'text' },
    { name: 'subtitleEn', type: 'textarea' },
    { name: 'subtitleSi', type: 'textarea' },
    { name: 'showAllSchedules', type: 'checkbox', defaultValue: true },
    { name: 'selectedSchedules', type: 'relationship', relationTo: 'schedules', hasMany: true },
  ],
}

import { CalendarDays, MapPin } from 'lucide-react'

import { getStudentPortalData } from '@/utilities/studentPortal'

export default async function StudentSchedulePage() {
  const { enrollments, payload, req } = await getStudentPortalData()
  const classIds = enrollments
    .filter((item) => item.status === 'approved')
    .map((item) => (typeof item.class === 'object' ? item.class.id : item.class))
  const schedules = classIds.length
    ? (
        await payload.find({
          collection: 'schedules',
          depth: 1,
          overrideAccess: false,
          pagination: false,
          req,
          sort: 'displayOrder',
          where: { class: { in: classIds } },
        })
      ).docs
    : []

  return (
    <div className="py-12">
      <p className="premium-kicker text-[#034EA2]">Timetable</p>
      <h1 className="mt-3 text-4xl font-medium tracking-[-.025em] text-[#111827]">My schedule</h1>
      <p className="mt-3 text-[#6b7280]">Your approved weekly classes and locations.</p>
      <div className="mt-9 grid gap-5 md:grid-cols-2">
        {schedules.map((item) => {
          const course = typeof item.class === 'object' ? item.class : null
          return (
            <article className="rounded-md border border-black/8 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,.055)]" key={item.id}>
              <div className="flex items-center gap-3 text-[#034EA2]">
                <CalendarDays className="size-5" />
                <p className="font-semibold">{item.dayOfWeek}</p>
              </div>
              <h2 className="mt-5 text-2xl font-medium text-[#111827]">{course?.titleEn}</h2>
              <p className="mt-3 text-lg font-semibold text-[#111827]">{item.startTime} – {item.endTime}</p>
              <p className="mt-4 flex items-center gap-2 text-sm text-[#6b7280]">
                <MapPin className="size-4" /> {item.location} · <span className="capitalize">{item.mode}</span>
              </p>
            </article>
          )
        })}
        {!schedules.length ? <EmptyState text="Your schedule will appear after an enrollment is approved." /> : null}
      </div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-md border border-dashed border-[#034EA2]/25 bg-white p-8 text-[#6b7280]">{text}</p>
}

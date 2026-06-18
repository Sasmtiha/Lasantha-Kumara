import { getStudentPortalData } from '@/utilities/studentPortal'

export default async function StudentSchedulePage() {
  const { enrollments, payload, req } = await getStudentPortalData()
  const classIds = enrollments.filter((item) => item.status === 'approved').map((item) => typeof item.class === 'object' ? item.class.id : item.class)
  const schedules = classIds.length ? (await payload.find({ collection: 'schedules', depth: 1, overrideAccess: false, pagination: false, req, sort: 'displayOrder', where: { class: { in: classIds } } })).docs : []
  return <div className="container py-12"><p className="section-kicker">Timetable</p><h1 className="section-title">My schedule</h1><div className="mt-8 grid gap-4 md:grid-cols-2">{schedules.map((item) => { const course = typeof item.class === 'object' ? item.class : null; return <article className="rounded-2xl border bg-white p-6" key={item.id}><p className="font-bold text-blue-700">{item.dayOfWeek}</p><h2 className="mt-2 text-xl font-bold text-navy">{course?.titleEn}</h2><p className="mt-2">{item.startTime} – {item.endTime}</p><p className="mt-2 text-sm text-muted-foreground">{item.location} · {item.mode}</p></article> })}{!schedules.length ? <p className="text-muted-foreground">Your schedule will appear after an enrollment is approved.</p> : null}</div></div>
}

import Link from 'next/link'

import { getStudentPortalData } from '@/utilities/studentPortal'

export default async function StudentDashboard() {
  const { enrollments, student, user } = await getStudentPortalData()
  const approved = enrollments.filter((item) => item.status === 'approved')
  const latest = enrollments[0]
  const nextClass = approved[0]?.class

  return (
    <div className="container py-12">
      <p className="section-kicker">Student dashboard</p>
      <h1 className="section-title">Welcome, {user.firstName}</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <DashboardCard label="Enrollment status" value={latest?.status || student?.enrollmentStatus || 'Not enrolled'} />
        <DashboardCard label="Approved classes" value={String(approved.length)} />
        <DashboardCard label="Current class" value={typeof nextClass === 'object' ? nextClass.titleEn : 'Awaiting approval'} />
      </div>
      <div className="mt-10 rounded-3xl border bg-white p-7">
        <h2 className="text-2xl font-bold text-[#111827]">Quick links</h2>
        <div className="mt-5 flex flex-wrap gap-3"><QuickLink href="/student/schedule" label="View schedule" /><QuickLink href="/student/resources" label="Learning resources" /><QuickLink href="/student/notices" label="Recent notices" /></div>
      </div>
    </div>
  )
}

function DashboardCard({ label, value }: { label: string; value: string }) {
  return <article className="rounded-md border bg-white p-6 shadow-sm"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold capitalize text-[#111827]">{value}</p></article>
}
function QuickLink({ href, label }: { href: string; label: string }) {
  return <Link className="rounded-xl bg-blue-50 px-4 py-3 font-semibold text-blue-900" href={href}>{label}</Link>
}

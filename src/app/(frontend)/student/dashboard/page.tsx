import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

import { getStudentPortalData } from '@/utilities/studentPortal'

export default async function StudentDashboard() {
  const { enrollments, student, user } = await getStudentPortalData()
  const approved = enrollments.filter((item) => item.status === 'approved')
  const latest = enrollments[0]
  const nextClass = approved[0]?.class
  const currentClass =
    typeof nextClass === 'object' ? nextClass.titleEn : 'Awaiting approval'

  return (
    <div className="py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="premium-kicker text-[#034EA2]">Overview</p>
          <h2 className="mt-3 text-4xl font-medium tracking-[-.025em] text-[#111827]">
            Welcome back, {user.firstName}
          </h2>
          <p className="mt-3 text-[#6b7280]">Here is your latest learning activity at IEM.lk.</p>
        </div>
        <Link className="premium-button-primary inline-flex" href="/#contact">
          Contact institute <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <DashboardCard
          icon={CheckCircle2}
          label="Enrollment status"
          value={latest?.status || student?.enrollmentStatus || 'Not enrolled'}
        />
        <DashboardCard
          icon={GraduationCap}
          label="Approved classes"
          value={String(approved.length)}
        />
        <DashboardCard icon={BookOpen} label="Current class" value={currentClass} />
      </div>

      <section className="mt-8 rounded-md border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,.06)] sm:p-8">
        <div>
          <p className="premium-kicker text-[#034EA2]">Student services</p>
          <h2 className="mt-2 text-2xl font-medium text-[#111827]">Continue your learning</h2>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QuickLink
            description="Check your weekly class times and locations."
            href="/student/schedule"
            icon={CalendarDays}
            label="View schedule"
          />
          <QuickLink
            description="Access notes, worksheets and shared materials."
            href="/student/resources"
            icon={BookOpen}
            label="Learning resources"
          />
          <QuickLink
            description="Stay informed about important class updates."
            href="/student/notices"
            icon={Bell}
            label="Recent notices"
          />
          <QuickLink
            description="Review your exam marks, grades and progress chart."
            href="/student/performance"
            icon={TrendingUp}
            label="My performance"
          />
        </div>
      </section>
    </div>
  )
}

type Icon = React.ComponentType<{ className?: string }>

function DashboardCard({ icon: Icon, label, value }: { icon: Icon; label: string; value: string }) {
  return (
    <article className="relative overflow-hidden rounded-md border border-black/8 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,.055)]">
      <span className="grid size-11 place-items-center rounded-md bg-[#eef5ff] text-[#034EA2]">
        <Icon className="size-5" />
      </span>
      <p className="mt-6 text-sm font-medium text-[#6b7280]">{label}</p>
      <p className="mt-2 text-2xl font-medium capitalize text-[#111827]">{value}</p>
      <span className="absolute inset-x-0 bottom-0 h-1 bg-[#034EA2]" />
    </article>
  )
}

function QuickLink({
  description,
  href,
  icon: Icon,
  label,
}: {
  description: string
  href: string
  icon: Icon
  label: string
}) {
  return (
    <Link
      className="group rounded-md border border-black/8 p-5 transition duration-300 hover:-translate-y-1 hover:border-[#034EA2]/35 hover:bg-[#f7faff] hover:shadow-[0_14px_35px_rgba(3,78,162,.08)]"
      href={href}
    >
      <div className="flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-md bg-[#034EA2] text-white">
          <Icon className="size-5" />
        </span>
        <ArrowUpRight className="size-5 text-[#9ca3af] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#034EA2]" />
      </div>
      <h3 className="mt-5 font-semibold text-[#111827]">{label}</h3>
      <p className="mt-2 text-sm leading-6 text-[#6b7280]">{description}</p>
    </Link>
  )
}

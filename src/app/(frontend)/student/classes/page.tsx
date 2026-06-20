import { ArrowUpRight, BookOpen } from 'lucide-react'
import Link from 'next/link'

import { getStudentPortalData } from '@/utilities/studentPortal'

export default async function StudentClassesPage() {
  const { enrollments } = await getStudentPortalData()

  return (
    <div className="py-12">
      <p className="premium-kicker text-[#034EA2]">Learning</p>
      <h1 className="mt-3 text-4xl font-medium tracking-[-.025em] text-[#111827]">My classes</h1>
      <p className="mt-3 text-[#6b7280]">View your enrolled classes and current approval status.</p>
      <div className="mt-9 grid gap-5 md:grid-cols-2">
        {enrollments.map((item) => {
          const course = typeof item.class === 'object' ? item.class : null

          return (
            <article className="rounded-md border border-black/8 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,.055)]" key={item.id}>
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-11 place-items-center rounded-md bg-[#eef5ff] text-[#034EA2]">
                  <BookOpen className="size-5" />
                </span>
                <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#034EA2]">
                  {item.status}
                </span>
              </div>
              <h2 className="mt-6 text-2xl font-medium text-[#111827]">{course?.titleEn || 'Class'}</h2>
              <p className="mt-3 leading-7 text-[#6b7280]">{course?.shortDescriptionEn}</p>
              {course?.slug ? (
                <Link className="mt-6 inline-flex items-center gap-2 font-semibold text-[#034EA2]" href={`/classes/${course.slug}`}>
                  Class details <ArrowUpRight className="size-4" />
                </Link>
              ) : null}
            </article>
          )
        })}
      </div>
    </div>
  )
}

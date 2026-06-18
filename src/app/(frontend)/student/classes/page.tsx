import Link from 'next/link'
import { getStudentPortalData } from '@/utilities/studentPortal'

export default async function StudentClassesPage() {
  const { enrollments } = await getStudentPortalData()
  return <div className="container py-12"><p className="section-kicker">Learning</p><h1 className="section-title">My classes</h1><div className="mt-8 grid gap-5 md:grid-cols-2">{enrollments.map((item) => { const course = typeof item.class === 'object' ? item.class : null; return <article className="rounded-2xl border bg-white p-6" key={item.id}><p className="text-sm font-bold uppercase text-blue-700">{item.status}</p><h2 className="mt-2 text-2xl font-bold text-navy">{course?.titleEn || 'Class'}</h2><p className="mt-3 text-muted-foreground">{course?.shortDescriptionEn}</p>{course?.slug ? <Link className="mt-5 inline-block font-bold text-blue-800" href={`/classes/${course.slug}`}>Class details →</Link> : null}</article> })}</div></div>
}

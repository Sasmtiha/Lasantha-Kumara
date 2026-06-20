import configPromise from '@payload-config'
import Link from 'next/link'
import { createLocalReq, getPayload } from 'payload'

import { getMeUser } from '@/utilities/getMeUser'

export default async function TeacherDashboard() {
  const { user } = await getMeUser({ nullUserRedirect: '/login' })
  const payload = await getPayload({ config: configPromise })
  const req = await createLocalReq({ user }, payload)
  const teachers = await payload.find({
    collection: 'teachers',
    depth: 2,
    limit: 1,
    overrideAccess: false,
    req,
    where: { user: { equals: user.id } },
  })
  const teacher = teachers.docs[0]
  const classes = (teacher?.classesHandled || []).filter(
    (course) => typeof course === 'object',
  )

  return (
    <div className="container py-14">
      <p className="section-kicker">Teacher dashboard</p>
      <h1 className="section-title">
        Welcome, {teacher?.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ')}
      </h1>
      <p className="section-subtitle">Review your assigned classes or open Payload Admin to manage schedules, resources, notices, and students.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="premium-button-primary" href="/admin">Open institute admin</Link>
        <Link className="premium-button-secondary" href="/schedule">View public schedule</Link>
      </div>
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-[#111827]">Assigned classes</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((course) => (
            <article className="rounded-2xl border bg-white p-6" key={course.id}>
              <h3 className="text-xl font-bold text-[#111827]">{course.titleEn}</h3>
              <p className="mt-2 text-muted-foreground">{course.shortDescriptionEn}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

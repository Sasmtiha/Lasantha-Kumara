import { ArrowUpRight, FileText } from 'lucide-react'

import { getStudentPortalData } from '@/utilities/studentPortal'

export default async function StudentResourcesPage() {
  const { enrollments, payload, req } = await getStudentPortalData()
  const classIds = enrollments
    .filter((item) => item.status === 'approved')
    .map((item) => (typeof item.class === 'object' ? item.class.id : item.class))
  const resources = classIds.length
    ? (
        await payload.find({
          collection: 'resources',
          depth: 2,
          overrideAccess: false,
          pagination: false,
          req,
          where: { and: [{ class: { in: classIds } }, { isPublished: { equals: true } }] },
        })
      ).docs
    : []

  return (
    <div className="py-12">
      <p className="premium-kicker text-[#034EA2]">Library</p>
      <h1 className="mt-3 text-4xl font-medium tracking-[-.025em] text-[#111827]">Learning resources</h1>
      <p className="mt-3 text-[#6b7280]">Notes, worksheets and materials shared for your classes.</p>
      <div className="mt-9 grid gap-5 md:grid-cols-2">
        {resources.map((item) => {
          const file = typeof item.file === 'object' ? item.file : null
          const href = item.externalUrl || file?.url
          return (
            <article className="rounded-md border border-black/8 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,.055)]" key={item.id}>
              <span className="grid size-11 place-items-center rounded-md bg-[#eef5ff] text-[#034EA2]">
                <FileText className="size-5" />
              </span>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#034EA2]">{item.resourceType}</p>
              <h2 className="mt-2 text-2xl font-medium text-[#111827]">{item.title}</h2>
              <p className="mt-3 leading-7 text-[#6b7280]">{item.description}</p>
              {href ? (
                <a className="mt-6 inline-flex items-center gap-2 font-semibold text-[#034EA2]" href={href} rel="noreferrer" target="_blank">
                  Open resource <ArrowUpRight className="size-4" />
                </a>
              ) : null}
            </article>
          )
        })}
        {!resources.length ? <p className="rounded-md border border-dashed border-[#034EA2]/25 bg-white p-8 text-[#6b7280]">Resources will appear here for your approved classes.</p> : null}
      </div>
    </div>
  )
}

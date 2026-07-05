import { Bell } from 'lucide-react'

import RichText from '@/components/RichText'
import { getStudentPortalData } from '@/utilities/studentPortal'

export default async function StudentNoticesPage() {
  const { payload, req } = await getStudentPortalData()
  const notices = (
    await payload.find({
      collection: 'notices',
      depth: 1,
      overrideAccess: false,
      limit: 100,
      req,
      sort: '-publishDate',
    })
  ).docs

  return (
    <div className="py-12">
      <p className="premium-kicker text-[#034EA2]">Updates</p>
      <h1 className="mt-3 text-4xl font-medium tracking-[-.025em] text-[#111827]">Notices</h1>
      <p className="mt-3 text-[#6b7280]">Important announcements and class updates from IEM.</p>
      <div className="mt-9 space-y-5">
        {notices.map((notice) => (
          <article className="rounded-md border border-black/8 bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,.055)] sm:p-7" key={notice.id}>
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-md bg-[#eef5ff] text-[#034EA2]">
                <Bell className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#034EA2]">{notice.priority}</p>
                <h2 className="mt-2 text-2xl font-medium text-[#111827]">{notice.title}</h2>
                <RichText className="mt-4 text-[#6b7280]" data={notice.message} enableGutter={false} />
              </div>
            </div>
          </article>
        ))}
        {!notices.length ? <p className="rounded-md border border-dashed border-[#034EA2]/25 bg-white p-8 text-[#6b7280]">There are no notices for you right now.</p> : null}
      </div>
    </div>
  )
}

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

  return <div className="container py-12"><p className="section-kicker">Updates</p><h1 className="section-title">Notices</h1><div className="mt-8 space-y-4">{notices.map((notice) => <article className="rounded-2xl border bg-white p-6" key={notice.id}><p className="text-xs font-bold uppercase text-blue-700">{notice.priority}</p><h2 className="mt-2 text-xl font-bold text-navy">{notice.title}</h2><RichText className="mt-3" data={notice.message} enableGutter={false} /></article>)}{!notices.length ? <p className="text-muted-foreground">There are no notices for you right now.</p> : null}</div></div>
}

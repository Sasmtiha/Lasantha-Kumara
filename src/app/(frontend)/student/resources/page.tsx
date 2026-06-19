import { getStudentPortalData } from '@/utilities/studentPortal'

export default async function StudentResourcesPage() {
  const { enrollments, payload, req } = await getStudentPortalData()
  const classIds = enrollments.filter((item) => item.status === 'approved').map((item) => typeof item.class === 'object' ? item.class.id : item.class)
  const resources = classIds.length ? (await payload.find({ collection: 'resources', depth: 2, overrideAccess: false, pagination: false, req, where: { and: [{ class: { in: classIds } }, { isPublished: { equals: true } }] } })).docs : []
  return <div className="container py-12"><p className="section-kicker">Library</p><h1 className="section-title">Learning resources</h1><div className="mt-8 grid gap-4 md:grid-cols-2">{resources.map((item) => { const file = typeof item.file === 'object' ? item.file : null; const href = item.externalUrl || file?.url; return <article className="rounded-md border bg-white p-6" key={item.id}><p className="text-sm font-bold uppercase text-[#034EA2]">{item.resourceType}</p><h2 className="mt-2 text-xl font-bold text-[#111827]">{item.title}</h2><p className="mt-2 text-muted-foreground">{item.description}</p>{href ? <a className="mt-5 inline-block font-bold text-[#034EA2]" href={href} rel="noreferrer" target="_blank">Open resource →</a> : null}</article> })}{!resources.length ? <p className="text-muted-foreground">Resources will appear here for your approved classes.</p> : null}</div></div>
}

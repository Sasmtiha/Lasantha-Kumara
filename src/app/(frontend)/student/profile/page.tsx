import { getStudentPortalData } from '@/utilities/studentPortal'

export default async function StudentProfilePage() {
  const { student, user } = await getStudentPortalData()
  return <div className="container py-12"><p className="section-kicker">Account</p><h1 className="section-title">My profile</h1><dl className="mt-8 grid max-w-3xl gap-5 rounded-3xl border bg-white p-7 sm:grid-cols-2"><Field label="Name" value={`${user.firstName} ${user.lastName}`} /><Field label="Email" value={user.email} /><Field label="Phone" value={student?.phone || user.phone} /><Field label="Grade / level" value={student?.gradeLevel} /><Field label="School" value={student?.school} /><Field label="Guardian" value={student?.guardianName} /></dl></div>
}
function Field({ label, value }: { label: string; value?: null | string }) { return <div><dt className="text-sm text-muted-foreground">{label}</dt><dd className="mt-1 font-semibold text-[#111827]">{value || 'Not provided'}</dd></div> }

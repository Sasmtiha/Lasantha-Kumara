import { UserRound } from 'lucide-react'

import { StudentPasswordChangeForm } from '@/components/institute/StudentPasswordChangeForm'
import { getStudentPortalData } from '@/utilities/studentPortal'
import { formatStudentId } from '@/utilities/studentCardNumber'


export default async function StudentProfilePage() {
  const { student, user } = await getStudentPortalData()

  return (
    <div className="py-12">
      <p className="premium-kicker text-[#034EA2]">Account</p>
      <h1 className="mt-3 text-4xl font-medium tracking-[-.025em] text-[#111827]">My profile</h1>
      <p className="mt-3 text-[#6b7280]">Your student and guardian information.</p>
      <div className="mt-9 grid gap-8 lg:grid-cols-2 lg:items-start max-w-7xl">
        <div className="overflow-hidden rounded-md border border-black/8 bg-white shadow-[0_18px_55px_rgba(15,23,42,.06)]">
          <div className="flex items-center gap-4 border-b border-black/8 bg-[#f7faff] p-6">
            <span className="grid size-12 place-items-center rounded-md bg-[#034EA2] text-white">
              <UserRound className="size-6" />
            </span>
            <div>
              <p className="text-xl font-semibold text-[#111827]">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-[#6b7280]">IEM registered student</p>
            </div>
          </div>
          <dl className="grid gap-x-8 gap-y-7 p-6 sm:grid-cols-2 sm:p-8">
            <Field label="Student ID" value={formatStudentId(student?.cardNumber as number | null | undefined) || 'Not assigned'} />
            <Field label="Email" value={user.email} />
            <Field label="Phone" value={student?.phone || user.phone} />
            <Field label="Grade / level" value={student?.gradeLevel} />
            <Field label="Payment status" value={student?.paymentStatus} />
            <Field label="School" value={student?.school} />
            <Field label="Guardian" value={student?.guardianName} />
          </dl>
        </div>
        <StudentPasswordChangeForm className="mt-0 w-full lg:max-w-none" required={Boolean(user.mustChangePassword)} />
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: null | string }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-wider text-[#6b7280]">{label}</dt><dd className="mt-2 font-semibold text-[#111827]">{value || 'Not provided'}</dd></div>
}

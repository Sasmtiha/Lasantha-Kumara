import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { getMeUser } from '@/utilities/getMeUser'

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const { user } = await getMeUser({ nullUserRedirect: '/login' })
  if (user.role !== 'teacher') redirect('/')
  return <main className="flex-1 bg-slate-50">{children}</main>
}

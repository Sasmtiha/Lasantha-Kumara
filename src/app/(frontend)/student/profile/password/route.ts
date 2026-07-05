import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { getMeUser } from '@/utilities/getMeUser'

type ChangePasswordInput = {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export async function POST(request: Request) {
  const auth = await getMeUser().catch(() => null)

  if (!auth?.user) {
    return Response.json({ message: 'Please sign in again.' }, { status: 401 })
  }

  const { user } = auth

  if (user.role !== 'student') {
    return Response.json({ message: 'Student access required.' }, { status: 403 })
  }

  const input = (await request.json()) as ChangePasswordInput
  const currentPassword = String(input.currentPassword || '')
  const newPassword = String(input.newPassword || '')
  const confirmPassword = String(input.confirmPassword || '')

  if (!currentPassword || !newPassword || !confirmPassword) {
    return Response.json({ message: 'Please complete every password field.' }, { status: 400 })
  }

  if (newPassword.length < 8) {
    return Response.json({ message: 'New password must be at least 8 characters.' }, { status: 400 })
  }

  if (newPassword !== confirmPassword) {
    return Response.json({ message: 'New password and confirmation do not match.' }, { status: 400 })
  }

  if (newPassword === currentPassword) {
    return Response.json(
      { message: 'Choose a new password that is different from the temporary password.' },
      { status: 400 },
    )
  }

  const payload = await getPayload({ config: configPromise })

  try {
    await payload.login({
      collection: 'users',
      data: {
        email: user.email,
        password: currentPassword,
      },
      overrideAccess: true,
    })
  } catch {
    return Response.json({ message: 'Current password is incorrect.' }, { status: 401 })
  }

  await payload.update({
    collection: 'users',
    id: user.id,
    overrideAccess: true,
    data: {
      password: newPassword,
      mustChangePassword: false,
    },
  })

  return Response.json({ success: true })
}

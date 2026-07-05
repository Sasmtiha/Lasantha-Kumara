import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

import type { User } from '../payload-types'
import { getClientSideURL } from './getURL'

const fetchMeUser = cache(async (token: string | undefined): Promise<User | null> => {
  if (!token) return null
  try {
    const meUserReq = await fetch(`${getClientSideURL()}/api/users/me`, {
      cache: 'no-store',
      headers: {
        Authorization: `JWT ${token}`,
      },
    })
    if (!meUserReq.ok) return null
    const { user }: { user: User } = await meUserReq.json()
    return user
  } catch {
    return null
  }
})

export const getMeUser = async (args?: {
  nullUserRedirect?: string
  validUserRedirect?: string
}): Promise<{
  token: string
  user: User
}> => {
  const { nullUserRedirect, validUserRedirect } = args || {}
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  const user = await fetchMeUser(token)

  if (validUserRedirect && user) {
    redirect(validUserRedirect)
  }

  if (nullUserRedirect && !user) {
    redirect(nullUserRedirect)
  }

  return {
    token: token!,
    user: user!,
  }
}

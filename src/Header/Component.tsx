import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

export async function Header() {
  const [headerData, requestHeaders] = await Promise.all([
    getCachedGlobal('header', 1)(),
    headers(),
  ])
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: requestHeaders })

  return (
    <HeaderClient
      data={headerData}
      user={
        user
          ? {
              firstName: user.firstName,
              role: user.role,
            }
          : null
      }
    />
  )
}

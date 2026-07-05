import type { AccessArgs } from 'payload'

import type { User } from '@/payload-types'
import { isActiveUser } from './roles'

type isAuthenticated = (args: AccessArgs<User>) => boolean

export const authenticated: isAuthenticated = ({ req: { user } }) => {
  return isActiveUser(user)
}

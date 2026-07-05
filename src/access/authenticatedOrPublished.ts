import type { Access } from 'payload'

import { getRole, isAdminRole } from './roles'

export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (isAdminRole(getRole(user))) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}

import type { Access, FieldAccess } from 'payload'

export const instituteRoles = ['super_admin', 'admin', 'teacher', 'student', 'parent'] as const

export type InstituteRole = (typeof instituteRoles)[number]

type RoleUser = {
  id?: number | string
  role?: InstituteRole | null
  status?: 'active' | 'inactive' | 'suspended' | null
}

export const getStatus = (user: unknown) => {
  if (!user || typeof user !== 'object' || !('status' in user)) return null
  return (user as RoleUser).status || null
}

export const isActiveUser = (user: unknown) => getStatus(user) === 'active'

export const getRole = (user: unknown): InstituteRole | null => {
  if (!isActiveUser(user)) return null
  if (!user || typeof user !== 'object' || !('role' in user)) return null
  return (user as RoleUser).role || null
}

export const isAdminRole = (role: InstituteRole | null) =>
  role === 'admin' || role === 'super_admin'

export const admins: Access = ({ req }) => isAdminRole(getRole(req.user))

export const adminsOrSelf: Access = ({ req }) => {
  if (!isActiveUser(req.user)) return false
  if (isAdminRole(getRole(req.user))) return true
  if (!req.user?.id) return false

  return {
    id: {
      equals: req.user.id,
    },
  }
}

export const adminFieldAccess: FieldAccess = ({ req }) => isAdminRole(getRole(req.user))

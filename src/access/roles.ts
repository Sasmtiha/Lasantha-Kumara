import type { Access, FieldAccess } from 'payload'

export const instituteRoles = ['super_admin', 'admin', 'teacher', 'student', 'parent'] as const

export type InstituteRole = (typeof instituteRoles)[number]

type RoleUser = {
  id?: number | string
  role?: InstituteRole | null
}

export const getRole = (user: unknown): InstituteRole | null => {
  if (!user || typeof user !== 'object' || !('role' in user)) return null
  return (user as RoleUser).role || null
}

export const isAdminRole = (role: InstituteRole | null) =>
  role === 'admin' || role === 'super_admin'

export const admins: Access = ({ req }) => isAdminRole(getRole(req.user))

export const adminsOrSelf: Access = ({ req }) => {
  if (isAdminRole(getRole(req.user))) return true
  if (!req.user?.id) return false

  return {
    id: {
      equals: req.user.id,
    },
  }
}

export const adminFieldAccess: FieldAccess = ({ req }) => isAdminRole(getRole(req.user))

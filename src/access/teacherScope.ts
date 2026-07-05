import type { PayloadRequest, Where } from 'payload'

import { getRole } from './roles'

const getRelationID = (value: unknown) => {
  if (value && typeof value === 'object' && 'id' in value) {
    return String(value.id)
  }

  return value === undefined || value === null ? undefined : String(value)
}

export const getTeacherClassIDs = async (req: PayloadRequest) => {
  if (getRole(req.user) !== 'teacher' || !req.user?.id) return []

  const teachers = await req.payload.find({
    collection: 'teachers',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    select: { classesHandled: true },
    where: { user: { equals: req.user.id } },
  })

  const teacher = teachers.docs[0]

  return (teacher?.classesHandled || []).map(getRelationID).filter(Boolean) as string[]
}

export const teacherClassWhere = async (
  req: PayloadRequest,
  field = 'class',
): Promise<false | Where> => {
  const classIDs = await getTeacherClassIDs(req)

  if (!classIDs.length) return false

  return {
    [field]: {
      in: classIDs,
    },
  }
}

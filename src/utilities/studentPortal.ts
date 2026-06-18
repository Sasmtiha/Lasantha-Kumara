import configPromise from '@payload-config'
import { createLocalReq, getPayload } from 'payload'

import { getMeUser } from './getMeUser'

export async function getStudentPortalData() {
  const { user } = await getMeUser({ nullUserRedirect: '/login' })
  if (user.role !== 'student') {
    throw new Error('Student access required.')
  }
  const payload = await getPayload({ config: configPromise })
  const req = await createLocalReq({ user }, payload)
  const students = await payload.find({
    collection: 'students',
    limit: 1,
    overrideAccess: false,
    req,
    where: { user: { equals: user.id } },
  })
  const student = students.docs[0] || null
  const enrollments = await payload.find({
    collection: 'enrollments',
    depth: 2,
    limit: 100,
    overrideAccess: false,
    req,
    sort: '-createdAt',
    where: { user: { equals: user.id } },
  })
  return { enrollments: enrollments.docs, payload, req, student, user }
}

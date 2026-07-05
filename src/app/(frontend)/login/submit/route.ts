import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { normalizeStudentId } from '@/utilities/studentCardNumber'

/**
 * Custom login endpoint that resolves student IDs (IEM0051, iem51, 51)
 * to the associated user email, then delegates to Payload's auth.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as { identifier?: string; password?: string }
  const identifier = String(body.identifier || '').trim()
  const password = String(body.password || '')

  if (!identifier || !password) {
    return Response.json(
      { errors: [{ message: 'Please enter your email or Student ID and password.' }] },
      { status: 400 },
    )
  }

  let email: string

  // If the identifier contains '@' it's an email — use directly
  if (identifier.includes('@')) {
    email = identifier.toLowerCase()
  } else {
    // Otherwise try to resolve as a student card number
    const cardNumber = normalizeStudentId(identifier)
    if (!cardNumber) {
      return Response.json(
        { errors: [{ message: 'Please enter a valid email address or Student ID.' }] },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })
    const students = await payload.find({
      collection: 'students',
      limit: 1,
      overrideAccess: true,
      depth: 1,
      where: { cardNumber: { equals: cardNumber } },
    })

    const student = students.docs[0]
    if (!student) {
      return Response.json(
        { errors: [{ message: 'No student found with this ID.' }] },
        { status: 401 },
      )
    }

    // Get the email from the related user
    const user = student.user
    if (typeof user === 'object' && user && 'email' in user) {
      email = String(user.email).toLowerCase()
    } else {
      // user is just an ID — look it up
      const payload2 = await getPayload({ config: configPromise })
      const userDoc = await payload2.findByID({
        collection: 'users',
        id: user as number,
        overrideAccess: true,
      })
      email = String(userDoc.email).toLowerCase()
    }
  }

  // Delegate to Payload's built-in login
  const origin = new URL(request.url).origin
  const loginResponse = await fetch(`${origin}/api/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: request.headers.get('cookie') || '',
    },
    body: JSON.stringify({ email, password }),
  })

  // Forward the response (including Set-Cookie headers for auth token)
  const responseBody = await loginResponse.text()
  const headers = new Headers()
  headers.set('Content-Type', 'application/json')

  // Forward all set-cookie headers from Payload's login response
  const setCookies = loginResponse.headers.getSetCookie?.() || []
  for (const cookie of setCookies) {
    headers.append('Set-Cookie', cookie)
  }

  return new Response(responseBody, {
    status: loginResponse.status,
    headers,
  })
}

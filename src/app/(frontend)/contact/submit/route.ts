import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function POST(request: Request) {
  const form = await request.formData()
  const required = ['firstName', 'lastName', 'email', 'phone', 'subject', 'message'] as const

  if (required.some((field) => !String(form.get(field) || '').trim())) {
    return Response.json({ message: 'Please complete all required fields.' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  await payload.create({
    collection: 'contact-submissions',
    data: {
      firstName: String(form.get('firstName')),
      lastName: String(form.get('lastName')),
      email: String(form.get('email')),
      phone: String(form.get('phone')),
      subject: String(form.get('subject')),
      message: String(form.get('message')),
      preferredClass: form.get('preferredClass')
        ? Number(form.get('preferredClass'))
        : undefined,
      status: 'new',
    },
  })

  return Response.json({ success: true }, { status: 201 })
}

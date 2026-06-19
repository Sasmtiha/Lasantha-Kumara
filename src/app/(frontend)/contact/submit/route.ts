import configPromise from '@payload-config'
import { getPayload } from 'payload'

export async function POST(request: Request) {
  const form = await request.formData()
  const required = ['fullName', 'email', 'phone', 'subject', 'message'] as const

  if (required.some((field) => !String(form.get(field) || '').trim())) {
    return Response.json({ message: 'Please complete all required fields.' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  const nameParts = String(form.get('fullName')).trim().split(/\s+/)
  const firstName = nameParts.shift() || 'Website'
  const lastName = nameParts.join(' ') || 'Visitor'
  await payload.create({
    collection: 'contact-submissions',
    data: {
      firstName,
      lastName,
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

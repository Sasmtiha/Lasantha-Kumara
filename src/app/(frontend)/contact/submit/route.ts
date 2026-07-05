import configPromise from '@payload-config'
import { getPayload } from 'payload'

const normalizeText = (value: FormDataEntryValue | null, maxLength = 500) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : ''

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export async function POST(request: Request) {
  const form = await request.formData()
  const fullName = normalizeText(form.get('fullName'), 160)
  const email = normalizeText(form.get('email'), 160).toLowerCase()
  const phone = normalizeText(form.get('phone'), 40)
  const subject = normalizeText(form.get('subject'), 160)
  const message = normalizeText(form.get('message'), 2000)
  const preferredClassValue = normalizeText(form.get('preferredClass'), 20)

  if (![fullName, email, phone, subject, message].every(Boolean) || !isValidEmail(email)) {
    return Response.json({ message: 'Please complete all required fields.' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })
  const nameParts = fullName.split(/\s+/)
  const firstName = nameParts.shift() || 'Website'
  const lastName = nameParts.join(' ') || 'Visitor'
  const preferredClass = preferredClassValue ? Number(preferredClassValue) : undefined

  if (preferredClass !== undefined && !Number.isInteger(preferredClass)) {
    return Response.json({ message: 'Please select a valid class.' }, { status: 400 })
  }

  try {
    const data = {
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      status: 'new' as const,
      ...(preferredClass !== undefined ? { preferredClass } : {}),
    }

    await payload.create({
      collection: 'contact-submissions',
      data,
    })
  } catch {
    return Response.json({ message: 'Message could not be submitted.' }, { status: 500 })
  }

  return Response.json({ success: true }, { status: 201 })
}

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import nodemailer from 'nodemailer'

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

  let classNameStr = ''
  if (preferredClass !== undefined) {
    try {
      const cls = await payload.findByID({
        collection: 'classes',
        id: preferredClass,
      })
      if (cls && typeof cls === 'object') {
        classNameStr = cls.titleEn || ''
      }
    } catch {
      // ignore
    }
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

    /*
    // Send email notification if SMTP is configured in env
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpFrom = process.env.SMTP_FROM || smtpUser
    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || 'iem.lasantha@gmail.com'

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPort) || 587,
        secure: Number(smtpPort) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      })

      const mailOptions = {
        from: smtpFrom,
        to: receiverEmail,
        subject: `IEM Contact Form: ${subject}`,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          ${classNameStr ? `<p><strong>Preferred Class:</strong> ${classNameStr}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-line; background-color: #f5f5f5; padding: 15px; border-radius: 4px;">${message}</p>
        `,
      }

      await transporter.sendMail(mailOptions)
    }
    */
  } catch (error) {
    console.error('Error handling contact submission:', error)
    return Response.json({ message: 'Message could not be submitted.' }, { status: 500 })
  }

  return Response.json({ success: true }, { status: 201 })
}

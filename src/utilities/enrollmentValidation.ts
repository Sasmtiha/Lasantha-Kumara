export const normalizeEnrollmentText = (value: unknown, maxLength = 200) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : ''

export const normalizeEnrollmentEmail = (value: unknown) =>
  normalizeEnrollmentText(value, 160).toLowerCase()

export const normalizeEnrollmentPhone = (value: unknown) => {
  if (typeof value !== 'string') return ''

  const cleaned = value.trim().slice(0, 40).replace(/[^\d+]/g, '')
  if (!cleaned) return ''

  return cleaned.startsWith('+')
    ? `+${cleaned.slice(1).replace(/\+/g, '')}`
    : cleaned.replace(/\+/g, '')
}

export const isValidEnrollmentEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export const isValidEnrollmentPhone = (value: string) => {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}
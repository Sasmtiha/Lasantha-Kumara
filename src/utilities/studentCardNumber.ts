export const STUDENT_ID_PREFIX = 'IEM'

/** Format a raw card number or input string (e.g. 51 or "IEM-51") into display form (e.g. "IEM0051") */
export function formatStudentId(cardNumber: number | string | null | undefined): string | null {
  if (cardNumber == null || String(cardNumber).trim() === '') return null
  const str = String(cardNumber).trim().toUpperCase().replace(/^IEM-?/, '')
  const num = parseInt(str, 10)
  if (Number.isFinite(num) && num > 0) {
    return `${STUDENT_ID_PREFIX}${String(num).padStart(4, '0')}`
  }
  return String(cardNumber)
}

/** Parse/normalize a student ID input like "IEM0051", "iem51", "51", or "IEM-51" into the canonical string "IEM0051" */
export function normalizeStudentId(input: string): string | null {
  const cleaned = input
    .trim()
    .toUpperCase()
    .replace(/^IEM-?/, '')
  const num = parseInt(cleaned, 10)
  if (Number.isFinite(num) && num > 0) {
    return `${STUDENT_ID_PREFIX}${String(num).padStart(4, '0')}`
  }
  return null
}


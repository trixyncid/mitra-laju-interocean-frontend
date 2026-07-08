/**
 * Normalize a phone number for wa.me links.
 * Handles Indonesian local (08…), country code (62…), and +62 E.164 formats.
 */
export function toWhatsAppUrl(phone: string): string | null {
  const trimmed = phone.trim()
  if (!trimmed) return null

  const digits = trimmed.replace(/\D/g, "")
  if (!digits) return null

  let normalized: string
  if (digits.startsWith("62")) {
    normalized = digits
  } else if (digits.startsWith("0")) {
    normalized = `62${digits.slice(1)}`
  } else if (digits.length >= 9 && digits.length <= 12) {
    normalized = `62${digits}`
  } else {
    return null
  }

  if (normalized.length < 11 || normalized.length > 15) return null

  return `https://wa.me/${normalized}`
}

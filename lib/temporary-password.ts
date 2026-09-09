const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"
const LOWER = "abcdefghijkmnopqrstuvwxyz"
const DIGIT = "23456789"
const SYMBOL = "!@#$%^&*-_=+"
const ALL = `${UPPER}${LOWER}${DIGIT}${SYMBOL}`

function randomIndex(max: number) {
  const limit = 256 - (256 % max)
  const bytes = new Uint8Array(1)
  let value = 0
  do {
    crypto.getRandomValues(bytes)
    value = bytes[0] ?? 0
  } while (value >= limit)
  return value % max
}

/** One-time password shown only in the admin UI after a successful reset. */
export function generateTemporaryPassword(length = 12) {
  const chars = [
    UPPER[randomIndex(UPPER.length)]!,
    LOWER[randomIndex(LOWER.length)]!,
    DIGIT[randomIndex(DIGIT.length)]!,
    SYMBOL[randomIndex(SYMBOL.length)]!,
  ]
  while (chars.length < length) {
    chars.push(ALL[randomIndex(ALL.length)]!)
  }
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1)
    const current = chars[i]!
    chars[i] = chars[j]!
    chars[j] = current
  }
  return chars.join("")
}

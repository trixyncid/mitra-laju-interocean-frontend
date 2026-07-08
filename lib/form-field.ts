export function fieldError(errors: unknown[]): string | undefined {
  if (!errors.length) return undefined
  const error = errors[0]
  return error != null ? String(error) : undefined
}

import { format } from "date-fns"

export function parseLocalDate(value?: string | null) {
  if (!value) return undefined

  const datePart = value.split("T")[0]
  if (!datePart) return undefined

  const parsed = new Date(`${datePart}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

export function toIsoDateOnly(date: Date) {
  return format(date, "yyyy-MM-dd")
}

/** Display helper for date-only fields (ETA, ETD, loading). Uses the calendar day, not the timezone. */
export function formatCalendarDate(value?: string | null, empty = "-") {
  const parsed = parseLocalDate(value)
  if (!parsed) return empty
  // date-fns, not Intl: some browsers write September as "Sept".
  return format(parsed, "d MMM yyyy")
}

export function formatSingleDateLabel(
  value?: string,
  placeholder = "Pick a date"
) {
  return formatCalendarDate(value, placeholder)
}

/** Persist date-only as yyyy-MM-dd so UTC+7 does not shift the calendar day. */
export function toStoredIsoDate(date: Date) {
  return toIsoDateOnly(date)
}

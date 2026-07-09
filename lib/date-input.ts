import { format } from "date-fns"

import { ISOFormat } from "@/lib/utils"

export function parseLocalDate(value?: string) {
  if (!value) return undefined

  const datePart = value.split("T")[0]
  if (!datePart) return undefined

  const parsed = new Date(`${datePart}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

export function toIsoDateOnly(date: Date) {
  return format(date, "yyyy-MM-dd")
}

export function formatSingleDateLabel(
  value?: string,
  placeholder = "Pick a date"
) {
  const parsed = parseLocalDate(value)
  if (!parsed) return placeholder
  return format(parsed, "dd MMM yyyy")
}

export function toStoredIsoDate(date: Date) {
  return ISOFormat(toIsoDateOnly(date))
}

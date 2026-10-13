/** One ticked value of a column filter, with the text shown for it. */
export type FilterEntry = { value: string; label: string }

/** A value a column can be filtered by, and how many rows have it. */
export type FacetValue = { value: string; label: string; count: number }

export type ColumnSort = { by: string; dir: "asc" | "desc" }

/** "list" ticks values; "date" ticks days in a Year ▸ Month ▸ Day tree. */
export type ColumnFilterKind = "list" | "date"

export type ColumnFilterField = {
  /** Name in chips and the menu title, e.g. "Vendor". */
  label: string
  kind: ColumnFilterKind
}

/** Rows with no value (no date, no tax invoice). */
export const BLANK = "blank"

/** Only the ticked values, for the request (labels stay in the saved state for the chips). */
export function columnValues(
  columns: Record<string, FilterEntry[]> | undefined,
  fields: Record<string, ColumnFilterField>
) {
  const values: Record<string, string[]> = {}
  for (const [field, entries] of Object.entries(columns ?? {})) {
    if (fields[field] && entries.length) values[field] = entries.map((entry) => entry.value)
  }
  return values
}

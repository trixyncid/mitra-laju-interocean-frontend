import { BLANK, type FacetValue } from "@/components/column-filter/types"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export type DayNode = { value: string; label: string; count: number }
export type MonthNode = { key: string; label: string; count: number; days: DayNode[] }
export type YearNode = { key: string; label: string; count: number; months: MonthNode[] }

/** Days ("2026-10-05") grouped into years and months, newest first. */
export function buildDateTree(facets: FacetValue[]): YearNode[] {
  const years = new Map<string, YearNode>()
  for (const facet of facets) {
    if (facet.value === BLANK) continue
    const [year, month, day] = facet.value.split("-")
    if (!year || !month || !day) continue
    const yearNode = years.get(year) ?? { key: year, label: year, count: 0, months: [] }
    years.set(year, yearNode)
    const monthKey = `${year}-${month}`
    let monthNode = yearNode.months.find((node) => node.key === monthKey)
    if (!monthNode) {
      monthNode = { key: monthKey, label: MONTHS[Number(month) - 1] ?? month, count: 0, days: [] }
      yearNode.months.push(monthNode)
    }
    monthNode.days.push({ value: facet.value, label: String(Number(day)), count: facet.count })
    monthNode.count += facet.count
    yearNode.count += facet.count
  }
  const desc = (a: string, b: string) => b.localeCompare(a)
  return [...years.values()]
    .sort((a, b) => desc(a.key, b.key))
    .map((year) => ({
      ...year,
      months: year.months
        .sort((a, b) => desc(a.key, b.key))
        .map((month) => ({ ...month, days: month.days.sort((a, b) => desc(a.value, b.value)) })),
    }))
}

/** True when a stored token ("2026", "2026-10", "2026-10-05" or blank) covers a value. */
export function tokenCovers(token: string, value: string) {
  if (token === BLANK || value === BLANK) return token === value
  return value === token || value.startsWith(`${token}-`)
}

/**
 * The fewest tokens for the ticked days: a whole year or month becomes one
 * token, so the request stays short.
 */
export function compactDays(checked: Set<string>, tree: YearNode[]): string[] {
  const tokens: string[] = []
  for (const year of tree) {
    const yearDays = year.months.flatMap((month) => month.days)
    if (yearDays.every((day) => checked.has(day.value))) {
      tokens.push(year.key)
      continue
    }
    for (const month of year.months) {
      if (month.days.every((day) => checked.has(day.value))) tokens.push(month.key)
      else tokens.push(...month.days.filter((day) => checked.has(day.value)).map((day) => day.value))
    }
  }
  if (checked.has(BLANK)) tokens.push(BLANK)
  return tokens
}

/** "2026", "Oct 2026", "5 Oct 2026" or "(Blanks)". */
export function dateTokenLabel(token: string) {
  if (token === BLANK) return "(Blanks)"
  const [year, month, day] = token.split("-")
  if (!month) return year
  const monthName = MONTHS[Number(month) - 1] ?? month
  return day ? `${Number(day)} ${monthName} ${year}` : `${monthName} ${year}`
}

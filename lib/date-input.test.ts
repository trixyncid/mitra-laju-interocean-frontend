import { describe, expect, test } from "bun:test"

import {
  formatCalendarDate,
  parseLocalDate,
  toIsoDateOnly,
  toStoredIsoDate,
} from "./date-input"

describe("calendar dates", () => {
  test("parseLocalDate reads the calendar day from date-only and UTC end-of-day", () => {
    const fromDateOnly = parseLocalDate("2025-03-15")
    const fromEndOfDay = parseLocalDate("2025-03-15T23:59:59.999Z")
    const fromMidnight = parseLocalDate("2025-03-15T00:00:00.000Z")

    expect(fromDateOnly?.getFullYear()).toBe(2025)
    expect(fromDateOnly?.getMonth()).toBe(2)
    expect(fromDateOnly?.getDate()).toBe(15)
    expect(fromEndOfDay?.getDate()).toBe(15)
    expect(fromMidnight?.getDate()).toBe(15)
  })

  test("formatCalendarDate keeps 15 Mar for UTC end-of-day values", () => {
    expect(formatCalendarDate("2025-03-15")).toBe("15 Mar 2025")
    expect(formatCalendarDate("2025-03-15T23:59:59.999Z")).toBe("15 Mar 2025")
    expect(formatCalendarDate("2025-03-15T00:00:00.000Z")).toBe("15 Mar 2025")
    expect(formatCalendarDate(null)).toBe("-")
  })

  test("toStoredIsoDate writes yyyy-MM-dd, not UTC end-of-day", () => {
    const picked = parseLocalDate("2025-03-15")
    expect(picked).toBeDefined()
    expect(toStoredIsoDate(picked!)).toBe("2025-03-15")
    expect(toIsoDateOnly(picked!)).toBe("2025-03-15")
    expect(toStoredIsoDate(picked!).includes("T")).toBe(false)
  })
})

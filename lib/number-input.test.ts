import { describe, expect, test } from "bun:test"

import {
  formatNumberFieldDisplay,
  formatNumberInputLive,
  normalizeUngroupedDecimal,
  parseLocaleNumber,
} from "./number-input"

describe("percentage decimals", () => {
  test("renders a stored 1.1 as a decimal", () => {
    expect(
      formatNumberFieldDisplay("1.1", {
        useGrouping: false,
        maximumFractionDigits: 2,
      })
    ).toBe("1,1")
    expect(
      formatNumberFieldDisplay(1.1, {
        useGrouping: false,
        maximumFractionDigits: 2,
      })
    ).toBe("1,1")
  })

  test("keeps a typed dot as the decimal mark when grouping is off", () => {
    expect(normalizeUngroupedDecimal("1.1")).toBe("1,1")
    expect(parseLocaleNumber(normalizeUngroupedDecimal("1.1"))).toBe(1.1)
    expect(
      formatNumberInputLive(normalizeUngroupedDecimal("1.1"), {
        useGrouping: false,
        maximumFractionDigits: 2,
      })
    ).toBe("1,1")
  })

  test("still treats a dot as a thousands separator in grouped amounts", () => {
    expect(parseLocaleNumber("1.100")).toBe(1100)
    expect(
      formatNumberFieldDisplay("1500.5", { maximumFractionDigits: 2 })
    ).toBe("1.500,5")
  })
})

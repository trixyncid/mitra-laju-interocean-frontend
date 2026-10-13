import { describe, expect, test } from "bun:test"

import { buildDateTree, compactDays, dateTokenLabel, tokenCovers } from "./date-tokens"

const facets = [
  { value: "2026-10-05", label: "", count: 2 },
  { value: "2026-10-01", label: "", count: 1 },
  { value: "2026-09-30", label: "", count: 4 },
  { value: "2025-12-24", label: "", count: 1 },
  { value: "blank", label: "(Blanks)", count: 3 },
]

describe("date tokens", () => {
  test("groups days by year and month, newest first", () => {
    const tree = buildDateTree(facets)
    expect(tree.map((year) => [year.key, year.count])).toEqual([
      ["2026", 7],
      ["2025", 1],
    ])
    expect(tree[0].months.map((month) => [month.label, month.days.map((day) => day.label)])).toEqual([
      ["Oct", ["5", "1"]],
      ["Sep", ["30"]],
    ])
  })

  test("compacts full months and years", () => {
    const tree = buildDateTree(facets)
    expect(compactDays(new Set(["2026-10-05", "2026-10-01", "2025-12-24", "blank"]), tree)).toEqual([
      "2026-10",
      "2025",
      "blank",
    ])
    expect(compactDays(new Set(["2026-10-05", "2026-09-30"]), tree)).toEqual(["2026-10-05", "2026-09"])
  })

  test("tokens cover their days, and labels read naturally", () => {
    expect(tokenCovers("2026", "2026-10-05")).toBe(true)
    expect(tokenCovers("2026-1", "2026-10-05")).toBe(false)
    expect(tokenCovers("blank", "blank")).toBe(true)
    expect(dateTokenLabel("2026-10")).toBe("Oct 2026")
    expect(dateTokenLabel("2026-10-05")).toBe("5 Oct 2026")
  })
})

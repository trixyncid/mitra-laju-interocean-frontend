import { describe, expect, test } from "bun:test"
import { getRoleHomePath } from "@/lib/role-home"

describe("getRoleHomePath", () => {
  test("maps role strings to the correct home", () => {
    expect(getRoleHomePath("admin")).toBe("/dashboard")
    expect(getRoleHomePath("superadmin")).toBe("/dashboard")
    expect(getRoleHomePath("costing_admin")).toBe("/dashboard/shipments")
    expect(getRoleHomePath("viewer")).toBe("/dashboard/shipments")
    expect(getRoleHomePath("domestic_admin")).toBe("/dashboard/shipments")
  })

  test("accepts a session user object with role", () => {
    expect(getRoleHomePath({ role: "admin" })).toBe("/dashboard")
    expect(getRoleHomePath({ role: "costing_admin" })).toBe("/dashboard/shipments")
    expect(getRoleHomePath({ id: "1", role: "export_admin", email: "a@b.c" })).toBe(
      "/dashboard/shipments"
    )
  })

  test("falls back to viewer home for missing or invalid role", () => {
    expect(getRoleHomePath(undefined)).toBe("/dashboard/shipments")
    expect(getRoleHomePath(null)).toBe("/dashboard/shipments")
    expect(getRoleHomePath({})).toBe("/dashboard/shipments")
    expect(getRoleHomePath({ role: "not-a-role" })).toBe("/dashboard/shipments")
    expect(getRoleHomePath("user")).toBe("/dashboard/shipments")
  })
})

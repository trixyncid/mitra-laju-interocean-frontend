import { describe, expect, it } from "bun:test"

import { canPickWithPermissions, pickerSources } from "@/lib/permissions"

const edit = { canView: true, canCreate: true, canEdit: true, canDelete: false }
const view = { canView: true, canCreate: false, canEdit: false, canDelete: false }

describe("picker access", () => {
  it("lets sales editors pick customers without the Customers page", () => {
    const perms = { SALES: edit }
    expect(canPickWithPermissions(perms, "CUSTOMER")).toBe(true)
    expect(pickerSources(perms, "CUSTOMER")).toEqual(["SALES"])
  })

  it("does not grant pickers to read-only roles", () => {
    expect(canPickWithPermissions({ SALES: view }, "CUSTOMER")).toBe(false)
  })

  it("treats page access as picker access", () => {
    expect(canPickWithPermissions({ PORT: view }, "PORT")).toBe(true)
  })

  it("never grants admin modules", () => {
    expect(canPickWithPermissions({ SALES: edit, SHIPMENT: edit }, "USER")).toBe(false)
  })
})

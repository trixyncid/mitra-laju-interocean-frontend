import { describe, expect, test } from "bun:test"

import {
  can,
  canAccessRouteWithPermissions,
  canManageRoles,
  canReadResource,
  canWriteResource,
  canWriteShipmentTypeWithPermissions,
  type MyPermissions,
  type RoleDetails,
} from "./permissions"

const adminPerms: MyPermissions["permissions"] = {}
const adminRole: RoleDetails = {
  id: "1",
  slug: "admin",
  name: "Admin",
  isSystem: true,
  allowedShipmentTypes: [],
}

const viewerPerms: MyPermissions["permissions"] = {
  DASHBOARD: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  SHIPMENT: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  COSTING: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  SELLING: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  CUSTOMER: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  VENDOR: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  PORT: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  VESSEL: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  CONTAINER: { canView: true, canCreate: false, canEdit: false, canDelete: false },
}

const domesticPerms: MyPermissions["permissions"] = {
  DASHBOARD: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  SHIPMENT: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  COSTING: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  CUSTOMER: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  VENDOR: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  PORT: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  VESSEL: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  CONTAINER: { canView: true, canCreate: false, canEdit: false, canDelete: false },
}

const domesticRole: RoleDetails = {
  id: "2",
  slug: "domestic_admin",
  name: "Domestic Admin",
  isSystem: false,
  allowedShipmentTypes: ["DOMESTIC"],
}

describe("dynamic permissions", () => {
  test("admin bypass", () => {
    expect(canReadResource(adminPerms, "dashboard", "admin")).toBe(true)
    expect(canWriteResource(adminPerms, "users", "admin")).toBe(true)
    expect(canAccessRouteWithPermissions(adminPerms, "/dashboard/roles", "admin")).toBe(
      true
    )
    void adminRole
  })

  test("viewer read-only", () => {
    expect(canReadResource(viewerPerms, "costings", "viewer")).toBe(true)
    expect(canWriteResource(viewerPerms, "costings", "viewer")).toBe(false)
    expect(canWriteResource(viewerPerms, "shipments", "viewer")).toBe(false)
  })

  test("domestic admin shipment type", () => {
    expect(canWriteResource(domesticPerms, "shipments", "domestic_admin")).toBe(true)
    expect(
      canWriteShipmentTypeWithPermissions(
        domesticPerms,
        domesticRole,
        "DOMESTIC",
        "domestic_admin"
      )
    ).toBe(true)
    expect(
      canWriteShipmentTypeWithPermissions(
        domesticPerms,
        domesticRole,
        "EXPORT",
        "domestic_admin"
      )
    ).toBe(false)
  })

  test("USER view is not manage access", () => {
    const userViewOnly: MyPermissions["permissions"] = {
      USER: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    }
    expect(can(userViewOnly, "USER", "view", "custom")).toBe(true)
    expect(can(userViewOnly, "USER", "create", "custom")).toBe(false)
    expect(can(userViewOnly, "USER", "edit", "custom")).toBe(false)
    expect(can(userViewOnly, "USER", "delete", "custom")).toBe(false)
    expect(canAccessRouteWithPermissions(userViewOnly, "/dashboard/users", "custom")).toBe(
      true
    )
    expect(can({}, "USER", "create", "admin")).toBe(true)
    expect(can({}, "USER", "delete", "superadmin")).toBe(true)
  })

  test("ROLE view is not role management access", () => {
    const roleViewOnly: MyPermissions["permissions"] = {
      ROLE: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    }
    expect(can(roleViewOnly, "ROLE", "view", "custom")).toBe(true)
    expect(canManageRoles("custom")).toBe(false)
    expect(canAccessRouteWithPermissions(roleViewOnly, "/dashboard/roles", "custom")).toBe(
      false
    )
  })

  test("financial modules blocked when flag is off", () => {
    expect(
      canAccessRouteWithPermissions(viewerPerms, "/dashboard/costings", "viewer")
    ).toBe(false)
    expect(
      canAccessRouteWithPermissions(viewerPerms, "/dashboard/sellings", "viewer")
    ).toBe(false)
  })
})

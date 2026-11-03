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
  DASHBOARD: { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
  SHIPMENT: { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
  VENDOR_INVOICE: { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
  SELLING: { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
  CUSTOMER: { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
  VENDOR: { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
  PORT: { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
  VESSEL: { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
  CONTAINER: { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
}

const domesticPerms: MyPermissions["permissions"] = {
  DASHBOARD: { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
  SHIPMENT: { canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: false },
  VENDOR_INVOICE: { canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: false },
  CUSTOMER: { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
  VENDOR: { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
  PORT: { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
  VESSEL: { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
  CONTAINER: { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
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
    expect(canReadResource(viewerPerms, "vendor-invoices", "viewer")).toBe(true)
    expect(canWriteResource(viewerPerms, "vendor-invoices", "viewer")).toBe(false)
    expect(canWriteResource(viewerPerms, "shipments", "viewer")).toBe(false)
  })

  test("export needs the Export flag and view", () => {
    const flags = { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true }
    expect(can({ SHIPMENT: flags }, "SHIPMENT", "export", "viewer")).toBe(true)
    expect(can({ SHIPMENT: { ...flags, canExport: false } }, "SHIPMENT", "export", "viewer")).toBe(false)
    expect(can({ SHIPMENT: { ...flags, canView: false } }, "SHIPMENT", "export", "viewer")).toBe(false)
    expect(can({}, "SHIPMENT", "export", "admin")).toBe(true)
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
      USER: { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
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
      ROLE: { canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: false },
    }
    expect(can(roleViewOnly, "ROLE", "view", "custom")).toBe(true)
    expect(canManageRoles("custom")).toBe(false)
    expect(canAccessRouteWithPermissions(roleViewOnly, "/dashboard/roles", "custom")).toBe(
      false
    )
  })

  test("financial modules are open when the flags are on", () => {
    expect(
      canAccessRouteWithPermissions(viewerPerms, "/dashboard/vendor-invoices", "viewer")
    ).toBe(true)
    expect(
      canAccessRouteWithPermissions(viewerPerms, "/dashboard/sellings", "viewer")
    ).toBe(true)
  })
})

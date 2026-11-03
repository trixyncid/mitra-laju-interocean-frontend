import {
  VENDOR_INVOICE_MODULE_ENABLED,
  COSTING_MODULE_ENABLED,
  SELLING_MODULE_ENABLED,
  SALES_MODULE_ENABLED,
  CUSTOMER_INVOICE_MODULE_ENABLED,
  isModuleEnabled,
} from "@/lib/feature-flags"

export type ShipmentType = "EXPORT" | "IMPORT" | "DOMESTIC"

export type AppModule =
  | "DASHBOARD"
  | "CUSTOMER"
  | "VENDOR"
  | "PORT"
  | "VESSEL"
  | "CONTAINER"
  | "SERVICE"
  | "SHIPMENT"
  | "VENDOR_INVOICE"
  | "COSTING"
  | "SELLING"
  | "SALES"
  | "CUSTOMER_INVOICE"
  | "USER"
  | "ROLE"

export const MODULE_LABEL: Record<AppModule, string> = {
  DASHBOARD: "Dashboard",
  CUSTOMER: "Customers",
  VENDOR: "Vendors",
  PORT: "Ports",
  VESSEL: "Vessels",
  CONTAINER: "Containers",
  SERVICE: "Services",
  SHIPMENT: "Shipments",
  VENDOR_INVOICE: "Vendor invoices",
  COSTING: "Costing",
  SELLING: "Selling",
  SALES: "Sales",
  CUSTOMER_INVOICE: "Customer invoices",
  USER: "Users",
  ROLE: "Roles",
}

/** @deprecated Prefer AppModule — kept for call-site compatibility. */
export type AppResource =
  | "dashboard"
  | "masterData"
  | "shipments"
  | "vendor-invoices"
  | "costings"
  | "sellings"
  | "sales"
  | "customer-invoices"
  | "users"
  | "roles"

export type PermissionAction = "view" | "create" | "edit" | "delete" | "export"

export type ModulePermissionFlags = {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canExport: boolean
}

/**
 * Modules whose table can be downloaded as Excel; only these show an Export
 * switch in the role editor. Mirrors the export routes in the backend.
 */
export const EXPORTABLE_MODULES: AppModule[] = [
  "SHIPMENT",
  "SALES",
  "VENDOR_INVOICE",
  "COSTING",
  "SELLING",
  "CUSTOMER_INVOICE",
  "CUSTOMER",
  "VENDOR",
  "VESSEL",
]

export type RoleDetails = {
  id: string | null
  slug: string
  name: string
  isSystem: boolean
  allowedShipmentTypes: ShipmentType[]
}

export type MyPermissions = {
  role: RoleDetails
  permissions: Partial<Record<AppModule, ModulePermissionFlags>>
}

export type UserRole = string

const RESOURCE_TO_MODULE: Record<Exclude<AppResource, "masterData">, AppModule> = {
  dashboard: "DASHBOARD",
  shipments: "SHIPMENT",
  "vendor-invoices": "VENDOR_INVOICE",
  costings: "COSTING",
  sellings: "SELLING",
  sales: "SALES",
  "customer-invoices": "CUSTOMER_INVOICE",
  users: "USER",
  roles: "ROLE",
}

const MASTER_MODULES: AppModule[] = ["CUSTOMER", "VENDOR", "PORT", "VESSEL", "CONTAINER", "SERVICE"]

export function isAdminRole(role: string | undefined | null): boolean {
  return role === "admin" || role === "superadmin"
}

export function parseUserRole(role: unknown): string | undefined {
  if (typeof role !== "string" || role.length === 0) return undefined
  if (role === "user") return "viewer"
  return role
}

export function getEffectiveRole(role: string | undefined): string {
  return role ?? "viewer"
}

export function formatRoleLabel(role: string): string {
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function flagsFor(
  permissions: MyPermissions["permissions"] | null | undefined,
  module: AppModule
): ModulePermissionFlags {
  return (
    permissions?.[module] ?? {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canExport: false,
    }
  )
}

export function can(
  permissions: MyPermissions["permissions"] | null | undefined,
  module: AppModule,
  action: PermissionAction,
  roleSlug?: string | null
): boolean {
  if (isAdminRole(roleSlug ?? undefined)) return true
  const flags = flagsFor(permissions, module)
  switch (action) {
    case "view":
      return flags.canView
    case "create":
      return flags.canCreate
    case "edit":
      return flags.canEdit
    case "delete":
      return flags.canDelete
    case "export":
      // Exporting is reading the table in bulk, so it also needs view.
      return flags.canView && Boolean(flags.canExport)
    default:
      return false
  }
}

export function canViewModule(
  permissions: MyPermissions["permissions"] | null | undefined,
  module: AppModule,
  roleSlug?: string | null
): boolean {
  return can(permissions, module, "view", roleSlug)
}

export function canWriteModule(
  permissions: MyPermissions["permissions"] | null | undefined,
  module: AppModule,
  roleSlug?: string | null
): boolean {
  return (
    can(permissions, module, "create", roleSlug) ||
    can(permissions, module, "edit", roleSlug) ||
    can(permissions, module, "delete", roleSlug)
  )
}

/** Legacy resource helpers used across existing UI. */
export function canReadResource(
  permissions: MyPermissions["permissions"] | null | undefined,
  resource: AppResource,
  roleSlug?: string | null
): boolean {
  if (isAdminRole(roleSlug ?? undefined)) return true
  if (resource === "masterData") {
    return MASTER_MODULES.some((m) => canViewModule(permissions, m, roleSlug))
  }
  return canViewModule(permissions, RESOURCE_TO_MODULE[resource], roleSlug)
}

export function canWriteResource(
  permissions: MyPermissions["permissions"] | null | undefined,
  resource: AppResource,
  roleSlug?: string | null
): boolean {
  if (isAdminRole(roleSlug ?? undefined)) return true
  if (resource === "masterData") {
    return MASTER_MODULES.some((m) => canWriteModule(permissions, m, roleSlug))
  }
  return canWriteModule(permissions, RESOURCE_TO_MODULE[resource], roleSlug)
}

export function allowedShipmentTypesFromRole(
  role: RoleDetails | null | undefined,
  roleSlug?: string | null
): ShipmentType[] | "all" {
  if (isAdminRole(roleSlug ?? role?.slug)) return "all"
  const types = role?.allowedShipmentTypes ?? []
  if (types.length === 0) return "all"
  return types
}

export function canWriteShipmentTypeWithPermissions(
  permissions: MyPermissions["permissions"] | null | undefined,
  role: RoleDetails | null | undefined,
  shipmentType: ShipmentType | string | undefined,
  roleSlug?: string | null
): boolean {
  if (!shipmentType) return false
  if (isAdminRole(roleSlug ?? role?.slug)) return true
  if (!canWriteModule(permissions, "SHIPMENT", roleSlug)) return false
  const allowed = allowedShipmentTypesFromRole(role, roleSlug)
  if (allowed === "all") return true
  return allowed.includes(shipmentType as ShipmentType)
}

export function getRouteModule(
  pathname: string
): AppModule | "profile" | null {
  if (pathname === "/dashboard/profile") return "profile"
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard?")) return "DASHBOARD"
  if (pathname.startsWith("/dashboard/users")) return "USER"
  if (pathname.startsWith("/dashboard/roles")) return "ROLE"
  if (pathname.startsWith("/dashboard/customers")) return "CUSTOMER"
  if (pathname.startsWith("/dashboard/vendors")) return "VENDOR"
  if (pathname.startsWith("/dashboard/ports")) return "PORT"
  if (pathname.startsWith("/dashboard/vessels")) return "VESSEL"
  if (pathname.startsWith("/dashboard/containers")) return "CONTAINER"
  if (pathname.startsWith("/dashboard/services")) return "SERVICE"
  if (pathname.startsWith("/dashboard/shipments")) return "SHIPMENT"
  if (pathname.startsWith("/dashboard/vendor-invoices")) return "VENDOR_INVOICE"
  if (pathname.startsWith("/dashboard/costings")) return "COSTING"
  if (pathname.startsWith("/dashboard/sellings")) return "SELLING"
  if (pathname.startsWith("/dashboard/sales")) return "SALES"
  if (pathname.startsWith("/dashboard/customer-invoices")) return "CUSTOMER_INVOICE"
  return null
}

/** @deprecated Prefer getRouteModule */
export function getRouteResource(
  pathname: string
): AppResource | "profile" | null {
  const module = getRouteModule(pathname)
  if (module === null) return null
  if (module === "profile") return "profile"
  if (
    module === "CUSTOMER" ||
    module === "VENDOR" ||
    module === "PORT" ||
    module === "VESSEL" ||
    module === "CONTAINER" ||
    module === "SERVICE"
  ) {
    return "masterData"
  }
  const reverse: Partial<Record<AppModule, AppResource>> = {
    DASHBOARD: "dashboard",
    SHIPMENT: "shipments",
    VENDOR_INVOICE: "vendor-invoices",
    COSTING: "costings",
    SELLING: "sellings",
    SALES: "sales",
    CUSTOMER_INVOICE: "customer-invoices",
    USER: "users",
    ROLE: "roles",
  }
  return reverse[module] ?? null
}

export function canAccessRouteWithPermissions(
  permissions: MyPermissions["permissions"] | null | undefined,
  pathname: string,
  roleSlug?: string | null
): boolean {
  const module = getRouteModule(pathname)
  if (module === null || module === "profile") return true
  if (module === "ROLE") return isAdminRole(roleSlug)
  if (
    (module === "VENDOR_INVOICE" || module === "COSTING" || module === "SELLING" || module === "SALES" || module === "CUSTOMER_INVOICE") &&
    !isModuleEnabled(module)
  ) {
    return false
  }
  return canViewModule(permissions, module, roleSlug)
}

/** Role management UI is restricted to system admin / superadmin. */
export function canManageRoles(roleSlug?: string | null): boolean {
  return isAdminRole(roleSlug)
}

/**
 * Picker access: choosing a module's records inside a form without having its
 * page. Never stored — granted automatically to roles that can create or edit a
 * module listed here. Mirrors PICKER_GRANTS in the backend's lib/permissions.ts.
 */
export const PICKER_GRANTS: Partial<Record<AppModule, AppModule[]>> = {
  SHIPMENT: ["CUSTOMER", "VENDOR", "PORT", "VESSEL", "CONTAINER", "SERVICE"],
  VENDOR: ["SERVICE"],
  VENDOR_INVOICE: ["VENDOR", "SHIPMENT", "CONTAINER"],
  COSTING: ["VENDOR", "SALES", "VENDOR_INVOICE"],
  SELLING: ["CUSTOMER", "SALES", "COSTING"],
  SALES: ["CUSTOMER", "SHIPMENT", "COSTING", "SELLING"],
  CUSTOMER_INVOICE: ["SALES", "SELLING"],
}

/** Modules whose create/edit access grants picker access to `module`. */
export function pickerSources(
  permissions: MyPermissions["permissions"] | null | undefined,
  module: AppModule
): AppModule[] {
  return (Object.keys(PICKER_GRANTS) as AppModule[]).filter((source) => {
    if (!PICKER_GRANTS[source]?.includes(module)) return false
    const flags = flagsFor(permissions, source)
    return flags.canCreate || flags.canEdit
  })
}

export function canPickWithPermissions(
  permissions: MyPermissions["permissions"] | null | undefined,
  module: AppModule,
  roleSlug?: string | null
): boolean {
  if (canViewModule(permissions, module, roleSlug)) return true
  return pickerSources(permissions, module).length > 0
}

export function canReadVendorsForVendorInvoiceWithPermissions(
  permissions: MyPermissions["permissions"] | null | undefined,
  roleSlug?: string | null
): boolean {
  return canPickWithPermissions(permissions, "VENDOR", roleSlug)
}

export function canReadShipmentsForVendorInvoiceWithPermissions(
  permissions: MyPermissions["permissions"] | null | undefined,
  roleSlug?: string | null
): boolean {
  return canPickWithPermissions(permissions, "SHIPMENT", roleSlug)
}

export function canReadContainersWithPermissions(
  permissions: MyPermissions["permissions"] | null | undefined,
  roleSlug?: string | null
): boolean {
  return (
    canPickWithPermissions(permissions, "CONTAINER", roleSlug) ||
    canViewModule(permissions, "SHIPMENT", roleSlug) ||
    canViewModule(permissions, "VENDOR_INVOICE", roleSlug)
  )
}

/** Prefer first module the user can view. */
export function getHomePathFromPermissions(
  permissions: MyPermissions["permissions"] | null | undefined,
  roleSlug?: string | null
): string {
  if (isAdminRole(roleSlug)) return "/dashboard"
  const order: { module: AppModule; path: string }[] = [
    { module: "DASHBOARD", path: "/dashboard" },
    { module: "SHIPMENT", path: "/dashboard/shipments" },
    ...(VENDOR_INVOICE_MODULE_ENABLED
      ? [{ module: "VENDOR_INVOICE" as const, path: "/dashboard/vendor-invoices" }]
      : []),
    ...(COSTING_MODULE_ENABLED
      ? [{ module: "COSTING" as const, path: "/dashboard/costings" }]
      : []),
    ...(SALES_MODULE_ENABLED
      ? [{ module: "SALES" as const, path: "/dashboard/sales" }]
      : []),
    ...(SELLING_MODULE_ENABLED
      ? [{ module: "SELLING" as const, path: "/dashboard/sellings" }]
      : []),
    ...(CUSTOMER_INVOICE_MODULE_ENABLED
      ? [{ module: "CUSTOMER_INVOICE" as const, path: "/dashboard/customer-invoices" }]
      : []),
    { module: "CUSTOMER", path: "/dashboard/customers" },
    { module: "USER", path: "/dashboard/users" },
  ]
  for (const item of order) {
    if (canViewModule(permissions, item.module, roleSlug)) return item.path
  }
  return "/dashboard/profile"
}

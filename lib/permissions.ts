import { FINANCIAL_MODULES_ENABLED } from "@/lib/feature-flags"

export type ShipmentType = "EXPORT" | "IMPORT" | "DOMESTIC"

export type AppModule =
  | "DASHBOARD"
  | "CUSTOMER"
  | "VENDOR"
  | "PORT"
  | "VESSEL"
  | "CONTAINER"
  | "SHIPMENT"
  | "COSTING"
  | "SELLING"
  | "USER"
  | "ROLE"

/** @deprecated Prefer AppModule — kept for call-site compatibility. */
export type AppResource =
  | "dashboard"
  | "masterData"
  | "shipments"
  | "costings"
  | "sellings"
  | "users"
  | "roles"

export type PermissionAction = "view" | "create" | "edit" | "delete"

export type ModulePermissionFlags = {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

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
  costings: "COSTING",
  sellings: "SELLING",
  users: "USER",
  roles: "ROLE",
}

const MASTER_MODULES: AppModule[] = ["CUSTOMER", "VENDOR", "PORT", "VESSEL", "CONTAINER"]

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
  if (pathname.startsWith("/dashboard/shipments")) return "SHIPMENT"
  if (pathname.startsWith("/dashboard/costings")) return "COSTING"
  if (pathname.startsWith("/dashboard/sellings")) return "SELLING"
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
    module === "CONTAINER"
  ) {
    return "masterData"
  }
  const reverse: Partial<Record<AppModule, AppResource>> = {
    DASHBOARD: "dashboard",
    SHIPMENT: "shipments",
    COSTING: "costings",
    SELLING: "sellings",
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
    !FINANCIAL_MODULES_ENABLED &&
    (module === "COSTING" || module === "SELLING")
  ) {
    return false
  }
  return canViewModule(permissions, module, roleSlug)
}

/** Role management UI is restricted to system admin / superadmin. */
export function canManageRoles(roleSlug?: string | null): boolean {
  return isAdminRole(roleSlug)
}

export function canReadVendorsForCostingWithPermissions(
  permissions: MyPermissions["permissions"] | null | undefined,
  roleSlug?: string | null
): boolean {
  return (
    isAdminRole(roleSlug) ||
    canViewModule(permissions, "VENDOR", roleSlug) ||
    canWriteModule(permissions, "COSTING", roleSlug)
  )
}

export function canReadShipmentsForCostingWithPermissions(
  permissions: MyPermissions["permissions"] | null | undefined,
  roleSlug?: string | null
): boolean {
  return (
    isAdminRole(roleSlug) ||
    canViewModule(permissions, "SHIPMENT", roleSlug) ||
    canWriteModule(permissions, "COSTING", roleSlug)
  )
}

export function canReadContainersWithPermissions(
  permissions: MyPermissions["permissions"] | null | undefined,
  roleSlug?: string | null
): boolean {
  return (
    isAdminRole(roleSlug) ||
    canWriteModule(permissions, "COSTING", roleSlug) ||
    canViewModule(permissions, "SHIPMENT", roleSlug) ||
    canWriteModule(permissions, "SHIPMENT", roleSlug)
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
    ...(FINANCIAL_MODULES_ENABLED
      ? [
          { module: "COSTING" as const, path: "/dashboard/costings" },
          { module: "SELLING" as const, path: "/dashboard/sellings" },
        ]
      : []),
    { module: "CUSTOMER", path: "/dashboard/customers" },
    { module: "USER", path: "/dashboard/users" },
  ]
  for (const item of order) {
    if (canViewModule(permissions, item.module, roleSlug)) return item.path
  }
  return "/dashboard/profile"
}

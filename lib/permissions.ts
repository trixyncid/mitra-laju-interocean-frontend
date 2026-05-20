export const USER_ROLES = [
  "viewer",
  "costing_admin",
  "domestic_admin",
  "export_admin",
  "operational_admin",
  "admin",
  "superadmin",
] as const

export type UserRole = (typeof USER_ROLES)[number]

export type ShipmentType = "EXPORT" | "IMPORT" | "DOMESTIC"

export type AppResource =
  | "dashboard"
  | "masterData"
  | "shipments"
  | "costings"
  | "sellings"
  | "users"

const FULL_ACCESS_ROLES: UserRole[] = ["admin", "superadmin"]

export function parseUserRole(role: unknown): UserRole | undefined {
  if (typeof role !== "string") return undefined
  if (role === "user") return "viewer"
  return USER_ROLES.includes(role as UserRole) ? (role as UserRole) : undefined
}

export function formatRoleLabel(role: string): string {
  const parsed = parseUserRole(role)
  if (!parsed) return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  const labels: Record<UserRole, string> = {
    viewer: "Viewer",
    costing_admin: "Costing Admin",
    domestic_admin: "Domestic Admin",
    export_admin: "Export Admin",
    operational_admin: "Operational Admin",
    admin: "Admin",
    superadmin: "Superadmin",
  }
  return labels[parsed]
}

/** README default role when session has no role (e.g. legacy accounts). */
export function getEffectiveRole(role: UserRole | undefined): UserRole {
  return role ?? "viewer"
}

export function isAdminRole(role: UserRole | undefined): boolean {
  return role === "admin" || role === "superadmin"
}

export function canRead(role: UserRole | undefined, resource: AppResource): boolean {
  if (!role) return false
  if (isAdminRole(role)) return true

  switch (resource) {
    case "dashboard":
      return false
    case "masterData":
      return false
    case "shipments":
      return (
        role === "viewer" ||
        role === "domestic_admin" ||
        role === "export_admin" ||
        role === "operational_admin"
      )
    case "costings":
      return (
        role === "viewer" ||
        role === "costing_admin" ||
        role === "domestic_admin" ||
        role === "export_admin" ||
        role === "operational_admin"
      )
    case "sellings":
      return role === "viewer" || isAdminRole(role)
    case "users":
      return false
    default:
      return false
  }
}

export function canWrite(role: UserRole | undefined, resource: AppResource): boolean {
  if (!role) return false
  if (isAdminRole(role)) return true

  switch (resource) {
    case "dashboard":
      return false
    case "masterData":
      return false
    case "shipments":
      return (
        role === "domestic_admin" ||
        role === "export_admin" ||
        role === "operational_admin"
      )
    case "costings":
      return (
        role === "costing_admin" ||
        role === "domestic_admin" ||
        role === "export_admin" ||
        role === "operational_admin"
      )
    case "sellings":
      return false
    case "users":
      return false
    default:
      return false
  }
}

export function allowedShipmentTypes(role: UserRole | undefined): ShipmentType[] | "all" {
  if (!role || isAdminRole(role) || role === "viewer") return "all"
  if (role === "domestic_admin") return ["DOMESTIC"]
  if (role === "export_admin") return ["EXPORT"]
  if (role === "operational_admin") return ["EXPORT", "IMPORT", "DOMESTIC"]
  return []
}

export function canWriteShipmentType(
  role: UserRole | undefined,
  shipmentType: ShipmentType | string | undefined
): boolean {
  if (!role || !shipmentType) return false
  if (!canWrite(role, "shipments")) return false
  if (isAdminRole(role) || role === "operational_admin") return true

  const type = shipmentType as ShipmentType
  if (role === "domestic_admin") return type === "DOMESTIC"
  if (role === "export_admin") return type === "EXPORT"
  return false
}

export function getRouteResource(pathname: string): AppResource | "profile" | null {
  if (pathname === "/dashboard/profile") return "profile"
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard?")) return "dashboard"
  if (pathname.startsWith("/dashboard/users")) return "users"
  if (
    pathname.startsWith("/dashboard/customers") ||
    pathname.startsWith("/dashboard/vendors") ||
    pathname.startsWith("/dashboard/ports") ||
    pathname.startsWith("/dashboard/vessels")
  ) {
    return "masterData"
  }
  if (pathname.startsWith("/dashboard/shipments")) return "shipments"
  if (pathname.startsWith("/dashboard/costings")) return "costings"
  if (pathname.startsWith("/dashboard/sellings")) return "sellings"
  return null
}

/** Vendors list for costing forms. */
export function canReadVendorsForCosting(role: UserRole | undefined): boolean {
  const r = getEffectiveRole(role)
  return (
    isAdminRole(r) ||
    canRead(r, "masterData") ||
    canWrite(r, "costings")
  )
}

/** Shipments list for linking costings. */
export function canReadShipmentsForCosting(role: UserRole | undefined): boolean {
  const r = getEffectiveRole(role)
  return (
    isAdminRole(r) ||
    canRead(r, "shipments") ||
    canWrite(r, "costings")
  )
}

/** Global containers list (`GET /containers`). */
export function canReadContainers(role: UserRole | undefined): boolean {
  const r = getEffectiveRole(role)
  if (isAdminRole(r) || canWrite(r, "costings")) return true
  return canRead(r, "shipments") || canWrite(r, "shipments")
}

export function canAccessRoute(role: UserRole | undefined, pathname: string): boolean {
  const effectiveRole = getEffectiveRole(role)
  const resource = getRouteResource(pathname)
  if (resource === null) return true
  if (resource === "profile") return true
  return canRead(effectiveRole, resource)
}


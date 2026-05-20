import { getEffectiveRole, parseUserRole, type UserRole } from "@/lib/permissions"

/** First page to open after login based on role. */
export function getRoleHomePath(role: unknown): string {
  const parsed = getEffectiveRole(parseUserRole(role))
  const paths: Record<UserRole, string> = {
    viewer: "/dashboard/shipments",
    costing_admin: "/dashboard/costings",
    domestic_admin: "/dashboard/shipments",
    export_admin: "/dashboard/shipments",
    operational_admin: "/dashboard/shipments",
    admin: "/dashboard",
    superadmin: "/dashboard",
  }
  return paths[parsed]
}

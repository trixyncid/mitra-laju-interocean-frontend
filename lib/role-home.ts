import { getEffectiveRole, parseUserRole, type UserRole } from "@/lib/permissions"

/** Accept a role string or a session user object with a `role` field. */
function resolveRole(roleOrUser: unknown): UserRole | undefined {
  if (typeof roleOrUser === "string" || roleOrUser == null) {
    return parseUserRole(roleOrUser)
  }
  if (typeof roleOrUser === "object" && "role" in roleOrUser) {
    return parseUserRole((roleOrUser as { role: unknown }).role)
  }
  return undefined
}

/** First page to open after login based on role. */
export function getRoleHomePath(roleOrUser: unknown): string {
  const parsed = getEffectiveRole(resolveRole(roleOrUser))
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

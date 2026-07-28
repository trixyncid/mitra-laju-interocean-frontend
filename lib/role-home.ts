import {
  getEffectiveRole,
  getHomePathFromPermissions,
  parseUserRole,
  type MyPermissions,
  type UserRole,
} from "@/lib/permissions"

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

function resolvePermissions(roleOrUser: unknown): MyPermissions["permissions"] | null {
  if (!roleOrUser || typeof roleOrUser !== "object") return null
  const user = roleOrUser as {
    permissions?: MyPermissions["permissions"]
  }
  return user.permissions ?? null
}

/** First page to open after login based on role / permissions. */
export function getRoleHomePath(roleOrUser: unknown): string {
  const role = getEffectiveRole(resolveRole(roleOrUser))
  const permissions = resolvePermissions(roleOrUser)
  if (permissions) {
    return getHomePathFromPermissions(permissions, role)
  }

  // Fallback when permissions are not yet on the session object.
  if (role === "admin" || role === "superadmin") return "/dashboard"
  if (role === "costing_admin") return "/dashboard/costings"
  return "/dashboard/shipments"
}

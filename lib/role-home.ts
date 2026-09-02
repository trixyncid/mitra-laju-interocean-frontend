import { FINANCIAL_MODULES_ENABLED } from "@/lib/feature-flags"
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

  // Slug fallback only when permissions are unavailable (e.g. fetch failed).
  if (role === "admin" || role === "superadmin") return "/dashboard"
  if (role === "costing_admin") {
    return FINANCIAL_MODULES_ENABLED ? "/dashboard/costings" : "/dashboard/shipments"
  }
  return "/dashboard/shipments"
}

export async function resolveRoleHomePathAfterAuth(
  user: unknown
): Promise<string> {
  const permissions = resolvePermissions(user)
  if (permissions) {
    return getRoleHomePath(user)
  }

  try {
    const { meService } = await import("@/services/me.service")
    const fetched = await meService.getPermissions()
    return getHomePathFromPermissions(fetched.permissions, fetched.role.slug)
  } catch {
    return getRoleHomePath(user)
  }
}

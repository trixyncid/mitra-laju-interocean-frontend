"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import {
  can,
  isAdminRole,
  parseUserRole,
  type PermissionAction,
  type UserRole,
} from "@/lib/permissions"
import { getRoleHomePath } from "@/lib/role-home"
import { useMyPermissions } from "@/hooks/use-my-permissions"

export function getUserRole(user: unknown): UserRole | undefined {
  if (!user || typeof user !== "object" || !("role" in user)) return undefined
  return parseUserRole((user as { role: string }).role)
}

export { isAdminRole, parseUserRole }
export type { UserRole }

export function useRequireAdmin(options?: {
  action?: PermissionAction
  redirectTo?: string
  redirect?: boolean
}) {
  const action = options?.action ?? "view"
  const shouldRedirect = options?.redirect !== false
  const router = useRouter()
  const { data: session, isPending, error } = authClient.useSession()
  const { permissions, isPending: permsPending } = useMyPermissions()
  const role = getUserRole(session?.user)
  const isAdmin = isAdminRole(role)
  const perms = permissions?.permissions

  const canViewUsers = can(perms, "USER", "view", role)
  const canCreateUsers = can(perms, "USER", "create", role)
  const canEditUsers = can(perms, "USER", "edit", role)
  const canDeleteUsers = can(perms, "USER", "delete", role)

  const allowed =
    action === "view"
      ? canViewUsers
      : action === "create"
        ? canCreateUsers
        : action === "edit"
          ? canEditUsers
          : canDeleteUsers

  const defaultRedirect =
    action === "view" || !canViewUsers
      ? getRoleHomePath(session?.user)
      : "/dashboard/users"
  const targetPath = options?.redirectTo ?? defaultRedirect

  useEffect(() => {
    if (shouldRedirect && !isPending && !permsPending && !allowed) {
      router.replace(targetPath)
    }
  }, [shouldRedirect, isPending, permsPending, allowed, targetPath, router])

  return {
    session,
    isPending: isPending || permsPending,
    error,
    isAdmin,
    canViewUsers,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    isRedirecting: shouldRedirect && !isPending && !permsPending && !allowed,
  }
}

"use client"

import { useQuery } from "@tanstack/react-query"

import { authClient } from "@/lib/auth-client"
import { getUserRole } from "@/hooks/use-require-admin"
import { meService } from "@/services/me.service"
import type { MyPermissions } from "@/lib/permissions"

export function useMyPermissions() {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const roleSlug = getUserRole(session?.user)

  const query = useQuery({
    queryKey: ["me", "permissions", roleSlug ?? "anonymous"],
    queryFn: () => meService.getPermissions(),
    enabled: Boolean(session?.user),
    staleTime: 30_000,
  })

  const fromSession = extractPermissionsFromSession(session?.user)

  return {
    session,
    roleSlug,
    permissions: query.data ?? fromSession,
    isPending: sessionPending || (Boolean(session?.user) && query.isPending && !fromSession),
    error: query.error,
    refetch: query.refetch,
  }
}

function extractPermissionsFromSession(user: unknown): MyPermissions | null {
  if (!user || typeof user !== "object") return null
  const u = user as {
    role?: string
    roleDetails?: MyPermissions["role"]
    permissions?: MyPermissions["permissions"]
  }
  if (!u.permissions || !u.roleDetails) return null
  return {
    role: u.roleDetails,
    permissions: u.permissions,
  }
}

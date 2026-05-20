"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { isAdminRole, parseUserRole, type UserRole } from "@/lib/permissions"
import { getRoleHomePath } from "@/lib/role-home"

export function getUserRole(user: unknown): UserRole | undefined {
  if (!user || typeof user !== "object" || !("role" in user)) return undefined
  return parseUserRole((user as { role: string }).role)
}

export { isAdminRole, parseUserRole }
export type { UserRole }

export function useRequireAdmin(redirectTo?: string) {
  const router = useRouter()
  const { data: session, isPending, error } = authClient.useSession()
  const role = getUserRole(session?.user)
  const isAdmin = isAdminRole(role)
  const targetPath = redirectTo ?? getRoleHomePath(session?.user)

  useEffect(() => {
    if (!isPending && !isAdmin) {
      router.replace(targetPath)
    }
  }, [isPending, isAdmin, targetPath, router])

  return {
    session,
    isPending,
    error,
    isAdmin,
    isRedirecting: !isPending && !isAdmin,
  }
}

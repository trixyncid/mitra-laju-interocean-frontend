"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { getRoleHomePath } from "@/lib/role-home"
import { getUserRole, isAdminRole } from "@/hooks/use-require-admin"

/** Role management is restricted to system admin / superadmin. */
export function useRequireSystemAdmin(redirectTo?: string) {
  const router = useRouter()
  const { data: session, isPending, error } = authClient.useSession()
  const role = getUserRole(session?.user)
  const isSystemAdmin = isAdminRole(role)
  const targetPath = redirectTo ?? getRoleHomePath(session?.user)

  useEffect(() => {
    if (!isPending && !isSystemAdmin) {
      router.replace(targetPath)
    }
  }, [isPending, isSystemAdmin, targetPath, router])

  return {
    session,
    isPending,
    error,
    isSystemAdmin,
    isRedirecting: !isPending && !isSystemAdmin,
  }
}

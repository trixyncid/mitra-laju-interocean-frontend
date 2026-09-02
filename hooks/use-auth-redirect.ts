"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { getRoleHomePath, resolveRoleHomePathAfterAuth } from "@/lib/role-home"

/** Redirect authenticated users away from the login page. */
export function useGuestOnly(redirectTo?: string) {
  const router = useRouter()
  const { data: session, isPending, error } = authClient.useSession()
  const [targetPath, setTargetPath] = useState(redirectTo ?? "/dashboard")

  useEffect(() => {
    if (!session?.user) return
    if (redirectTo) {
      setTargetPath(redirectTo)
      return
    }
    let cancelled = false
    void resolveRoleHomePathAfterAuth(session.user).then((path) => {
      if (!cancelled) setTargetPath(path)
    })
    return () => {
      cancelled = true
    }
  }, [session?.user, redirectTo])

  useEffect(() => {
    if (!isPending && session && !error) {
      router.replace(targetPath)
    }
  }, [isPending, session, error, targetPath, router])

  const isRedirecting = !isPending && !!session && !error

  return { session, isPending, error, isRedirecting }
}

/** Redirect unauthenticated users to the login page. */
export function useRequireAuth(redirectTo = "/") {
  const router = useRouter()
  const { data: session, isPending, error } = authClient.useSession()
  const shouldRedirect = !isPending && (!session || !!error)

  useEffect(() => {
    if (shouldRedirect) {
      router.replace(redirectTo)
    }
  }, [shouldRedirect, redirectTo, router])

  const isRedirecting = shouldRedirect

  return { session, isPending, error, isRedirecting }
}

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { getRoleHomePath } from "@/lib/role-home"

/** Redirect authenticated users away from the login page. */
export function useGuestOnly(redirectTo?: string) {
  const router = useRouter()
  const { data: session, isPending, error } = authClient.useSession()
  const targetPath = redirectTo ?? getRoleHomePath(session?.user)

  useEffect(() => {
    if (!isPending && session) {
      router.replace(targetPath)
    }
  }, [isPending, session, targetPath, router])

  const isRedirecting = !isPending && !!session

  return { session, isPending, error, isRedirecting }
}

/** Redirect unauthenticated users to the login page. */
export function useRequireAuth(redirectTo = "/") {
  const router = useRouter()
  const { data: session, isPending, error } = authClient.useSession()

  useEffect(() => {
    if (!isPending && !session && !error) {
      router.replace(redirectTo)
    }
  }, [isPending, session, error, redirectTo, router])

  const isRedirecting = !isPending && !session && !error

  return { session, isPending, error, isRedirecting }
}

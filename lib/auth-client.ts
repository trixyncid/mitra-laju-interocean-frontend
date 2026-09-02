import { createAuthClient } from "better-auth/react"
import { toast } from "sonner"

import { getAuthBasePath, normalizeBackendUrl } from "@/lib/backend-url"

const serverBaseUrl = normalizeBackendUrl(process.env.NEXT_PUBLIC_BACKEND_URL)

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : serverBaseUrl,
  basePath: getAuthBasePath(),
  fetchOptions: {
    credentials: "include",
  },
})

let handlingExpiredSession = false

/** Sign out once on an expired API session, then send the user to login. */
export async function signOutExpiredSession() {
  if (typeof window === "undefined") return
  if (handlingExpiredSession) return
  handlingExpiredSession = true

  toast.dismiss()

  try {
    await authClient.signOut()
  } catch {
    // Cookie is already invalid or the sign-out call failed.
  }

  if (window.location.pathname !== "/") {
    window.location.replace("/")
  }
}

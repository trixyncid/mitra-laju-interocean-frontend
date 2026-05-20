import { createAuthClient } from "better-auth/react"

import { getAuthBasePath, getBackendBaseUrl, normalizeBackendUrl } from "@/lib/backend-url"

const serverBaseUrl = normalizeBackendUrl(process.env.NEXT_PUBLIC_BACKEND_URL)

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : serverBaseUrl,
  basePath: getAuthBasePath(),
  fetchOptions: {
    credentials: "include",
  },
})

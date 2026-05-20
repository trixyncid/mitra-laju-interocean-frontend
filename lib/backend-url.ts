/** Strip quotes and trailing slashes from env URLs. */
export function normalizeBackendUrl(url: string | undefined) {
  if (!url) return ""
  return url.replace(/^["']|["']$/g, "").replace(/\/$/, "")
}

/**
 * Browser: same-origin proxy (`/api-backend/*` → backend) so session cookies work.
 * Server: direct backend URL from env.
 */
export function getBackendBaseUrl() {
  if (typeof window !== "undefined") {
    return "/api-backend"
  }

  const url = normalizeBackendUrl(process.env.NEXT_PUBLIC_BACKEND_URL)
  if (!url) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured")
  }
  return url
}

export function getAuthBasePath() {
  return typeof window !== "undefined" ? "/api-backend/auth" : "/auth"
}

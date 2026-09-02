export const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
] as const

export type SessionStatus = "valid" | "invalid" | "unknown"

export function hasSessionCookie(hasCookie: (name: string) => boolean) {
  return SESSION_COOKIE_NAMES.some((name) => hasCookie(name))
}

export function isSessionPayloadValid(payload: unknown): boolean {
  if (payload == null || payload === false) return false
  if (typeof payload !== "object") return false
  const data = payload as { session?: unknown; user?: unknown }
  return Boolean(data.session || data.user)
}

export function sessionStatusFromGetSessionResponse(
  httpStatus: number,
  payload: unknown
): SessionStatus {
  if (httpStatus === 401 || httpStatus === 403) return "invalid"
  if (httpStatus < 200 || httpStatus >= 300) return "unknown"
  return isSessionPayloadValid(payload) ? "valid" : "invalid"
}

/**
 * `/` only bounces to the app when the session is known-good.
 * `/dashboard` still requires a missing/expired cookie to send the user back to login.
 * "unknown" (backend unreachable) does not redirect either way.
 */
export function authRedirectPath(
  pathname: string,
  sessionStatus: SessionStatus
): "/" | "/dashboard" | null {
  if (pathname.startsWith("/dashboard") && sessionStatus === "invalid") {
    return "/"
  }
  if (pathname === "/" && sessionStatus === "valid") {
    return "/dashboard"
  }
  return null
}

import { NextRequest, NextResponse } from "next/server"

import { normalizeBackendUrl } from "@/lib/backend-url"
import {
  authRedirectPath,
  hasSessionCookie,
  sessionStatusFromGetSessionResponse,
  type SessionStatus,
} from "@/lib/proxy-session"

const SESSION_CHECK_TIMEOUT_MS = 2500

async function getBackendSessionStatus(
  request: NextRequest
): Promise<SessionStatus> {
  if (!hasSessionCookie((name) => request.cookies.has(name))) {
    return "invalid"
  }

  const backendUrl = normalizeBackendUrl(process.env.NEXT_PUBLIC_BACKEND_URL)
  if (!backendUrl) return "unknown"

  try {
    const response = await fetch(`${backendUrl}/auth/get-session`, {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
        origin: request.nextUrl.origin,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(SESSION_CHECK_TIMEOUT_MS),
    })

    let payload: unknown = null
    try {
      payload = await response.json()
    } catch {
      payload = null
    }

    return sessionStatusFromGetSessionResponse(response.status, payload)
  } catch {
    return "unknown"
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionStatus = await getBackendSessionStatus(request)
  const redirectTo = authRedirectPath(pathname, sessionStatus)

  if (redirectTo) {
    const url = request.nextUrl.clone()
    url.pathname = redirectTo
    url.search = ""
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
}

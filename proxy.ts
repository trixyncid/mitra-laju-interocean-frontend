import { NextRequest, NextResponse } from "next/server"

function hasSessionCookie(request: NextRequest) {
  return (
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token")
  )
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authenticated = hasSessionCookie(request)

  if (pathname.startsWith("/dashboard") && !authenticated) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/"
    loginUrl.search = ""
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === "/" && authenticated) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = "/dashboard"
    dashboardUrl.search = ""
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
}

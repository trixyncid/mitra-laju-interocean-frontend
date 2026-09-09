import { describe, expect, test } from "bun:test"

import {
  authRedirectPath,
  hasSessionCookie,
  isSessionPayloadValid,
  sessionStatusFromGetSessionResponse,
} from "./proxy-session"

describe("hasSessionCookie", () => {
  test("detects either Better Auth cookie name", () => {
    expect(hasSessionCookie((name) => name === "better-auth.session_token")).toBe(
      true
    )
    expect(
      hasSessionCookie((name) => name === "__Secure-better-auth.session_token")
    ).toBe(true)
    expect(hasSessionCookie(() => false)).toBe(false)
  })
})

describe("session payload", () => {
  test("null or empty get-session body is invalid", () => {
    expect(isSessionPayloadValid(null)).toBe(false)
    expect(isSessionPayloadValid(undefined)).toBe(false)
    expect(isSessionPayloadValid({})).toBe(false)
  })

  test("session or user object is valid", () => {
    expect(isSessionPayloadValid({ session: { id: "s1" } })).toBe(true)
    expect(isSessionPayloadValid({ user: { id: "u1" } })).toBe(true)
  })

  test("401/403 are invalid; other errors are unknown", () => {
    expect(sessionStatusFromGetSessionResponse(401, null)).toBe("invalid")
    expect(sessionStatusFromGetSessionResponse(403, null)).toBe("invalid")
    expect(sessionStatusFromGetSessionResponse(500, null)).toBe("unknown")
    expect(sessionStatusFromGetSessionResponse(200, null)).toBe("invalid")
    expect(
      sessionStatusFromGetSessionResponse(200, { session: { id: "s1" } })
    ).toBe("valid")
  })
})

describe("authRedirectPath", () => {
  test("expired cookie on / stays on login", () => {
    expect(authRedirectPath("/", "invalid")).toBeNull()
    expect(authRedirectPath("/", "unknown")).toBeNull()
  })

  test("missing cookie on /dashboard redirects to login", () => {
    expect(authRedirectPath("/dashboard", "invalid")).toBe("/")
    expect(authRedirectPath("/dashboard/shipments", "invalid")).toBe("/")
  })

  test("valid session on / redirects into the app", () => {
    expect(authRedirectPath("/", "valid")).toBe("/dashboard")
  })

  test("valid session on dashboard is not redirected", () => {
    expect(authRedirectPath("/dashboard", "valid")).toBeNull()
    expect(authRedirectPath("/dashboard", "unknown")).toBeNull()
  })
})

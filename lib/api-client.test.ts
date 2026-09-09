import { describe, expect, test } from "bun:test"

import { isUnauthorizedError, UnauthorizedError } from "./api-client"

describe("UnauthorizedError", () => {
  test("isUnauthorizedError detects the 401 sentinel", () => {
    expect(isUnauthorizedError(new UnauthorizedError())).toBe(true)
    expect(isUnauthorizedError(new Error("You do not have permission to access this resource."))).toBe(
      false
    )
  })
})

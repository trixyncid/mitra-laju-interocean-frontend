import { describe, expect, test } from "bun:test"

import { generateTemporaryPassword } from "./temporary-password"

describe("generateTemporaryPassword", () => {
  test("is 12 characters with upper, lower, digit, and symbol", () => {
    const password = generateTemporaryPassword()
    expect(password).toHaveLength(12)
    expect(password).toMatch(/[A-Z]/)
    expect(password).toMatch(/[a-z]/)
    expect(password).toMatch(/[0-9]/)
    expect(password).toMatch(/[!@#$%^&*\-_=+]/)
  })
})

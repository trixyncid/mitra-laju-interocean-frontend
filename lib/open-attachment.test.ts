import { describe, expect, test } from "bun:test";

import { isInlinePreviewContentType } from "./open-attachment";

describe("isInlinePreviewContentType", () => {
  test("allows PDFs and images", () => {
    expect(isInlinePreviewContentType("application/pdf")).toBe(true)
    expect(isInlinePreviewContentType("image/jpeg")).toBe(true)
  })

  test("rejects other MIME types", () => {
    expect(isInlinePreviewContentType("text/plain")).toBe(false)
    expect(isInlinePreviewContentType("application/octet-stream")).toBe(false)
  })
})

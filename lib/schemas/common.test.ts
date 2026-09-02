import { describe, expect, test } from "bun:test";

import { requiredPercentageSchema } from "./common";

const vatSchema = requiredPercentageSchema("VAT");

describe("requiredPercentageSchema", () => {
  test("accepts locale-formatted percentages", () => {
    expect(vatSchema.safeParse("11,5").success).toBe(true);
    expect(vatSchema.safeParse("10,5").success).toBe(true);
    expect(vatSchema.safeParse("10").success).toBe(true);
  });

  test("rejects invalid strings", () => {
    expect(vatSchema.safeParse("abc").success).toBe(false);
    expect(vatSchema.safeParse("").success).toBe(false);
  });

  test("rejects values above 100", () => {
    expect(vatSchema.safeParse("101").success).toBe(false);
  });
});

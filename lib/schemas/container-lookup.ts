import { z } from "zod"

export const containerLookupNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(50, "Name must be 50 characters or fewer")

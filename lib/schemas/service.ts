import { z } from "zod"

export const serviceCodeSchema = z
  .string()
  .trim()
  .min(1, "Code is required")
  .max(20, "Keep the code to 20 characters")
  .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, - or _ only")

export const serviceNameSchema = z.string().trim().min(1, "Service name is required")

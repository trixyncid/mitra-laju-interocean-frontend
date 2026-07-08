import { z } from "zod"

export const portNameSchema = z.string().trim().min(1, "Port Name is required")

export const portCountrySchema = z.string().trim().min(1, "Country is required")

export const portFormSchema = z.object({
  portName: portNameSchema,
  portCountry: portCountrySchema,
  isActive: z.boolean(),
})

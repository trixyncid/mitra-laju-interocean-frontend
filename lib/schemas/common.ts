import { z } from "zod"

import { parseLocaleNumber } from "@/lib/number-input"

export const requiredString = (label: string) =>
  z.string().trim().min(1, `${label} is required`)

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Invalid email address")

export const optionalEmailSchema = z.union([
  z.literal(""),
  z.string().email("Invalid email address"),
])

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")

export const newPasswordSchema = z
  .string()
  .min(1, "New password is required")
  .min(8, "Password must be at least 8 characters")

export const currentPasswordSchema = z.string().min(1, "Current password is required")

export const requiredFormNumberSchema = (label: string) =>
  z.union([z.string(), z.number()]).superRefine((val, ctx) => {
    if (val === "" || val === null || val === undefined) {
      ctx.addIssue({ code: "custom", message: `${label} is required` })
      return
    }

    const num = typeof val === "number" ? val : Number(String(val).replace(/\./g, "").replace(",", "."))
    if (!Number.isFinite(num)) {
      ctx.addIssue({ code: "custom", message: `${label} must be a valid number` })
    }
  })

export const requiredPercentageSchema = (label: string, maxMessage?: string) =>
  z.union([z.string(), z.number()]).superRefine((val, ctx) => {
    if (val === "" || val === null || val === undefined) {
      ctx.addIssue({
        code: "custom",
        message: `${label} is required. Input zero if not applicable`,
      })
      return
    }
    const num =
      typeof val === "number" ? val : parseLocaleNumber(String(val))
    if (num === "" || !Number.isFinite(num) || num > 100) {
      ctx.addIssue({
        code: "custom",
        message: maxMessage ?? `${label} must be less than or equal to 100`,
      })
    }
  })

export const selectRequiredSchema = (label: string) =>
  z.string().min(1, `${label} is required`)

export const selectNotDashSchema = (label: string) =>
  z.string().refine((value) => value !== "-", `${label} is required`)

export const requiredFileSchema = z
  .custom<File | null>((val) => val instanceof File, "Document File is required")

export const requiredSelectionSchema = (message: string) =>
  z.string().min(1, message)

export const containerSizeSchema = selectRequiredSchema("Container Size")
export const containerTypeSchema = selectRequiredSchema("Container Type")

export const shipmentTypeSchema = selectRequiredSchema("Shipment Type")

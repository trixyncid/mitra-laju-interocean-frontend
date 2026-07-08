import { requiredString } from "./common"
import { z } from "zod"

export const vendorCodeSchema = requiredString("Vendor Code")
export const vendorNameSchema = requiredString("Vendor Name")
export const npwpSchema = z.string()

export const vendorFormSchema = z.object({
  vendorCode: vendorCodeSchema,
  vendorName: vendorNameSchema,
  npwp: npwpSchema,
  isActive: z.boolean(),
})

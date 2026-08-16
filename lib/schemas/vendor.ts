import { requiredString } from "./common"
import { z } from "zod"

export const vendorCodeSchema = requiredString("Vendor Code")
export const vendorNameSchema = requiredString("Vendor Name")
export const npwpSchema = z.string()
export const vendorShipmentTypesSchema = z
  .array(z.enum(["EXPORT", "IMPORT", "DOMESTIC"]))
  .min(1, "Shipment Type is required")

export const vendorFormSchema = z.object({
  vendorCode: vendorCodeSchema,
  vendorName: vendorNameSchema,
  npwp: npwpSchema,
  shipmentTypes: vendorShipmentTypesSchema,
  isActive: z.boolean(),
})

import { requiredString } from "./common"
import { z } from "zod"

export const customerCodeSchema = requiredString("Customer Code")
export const customerNameSchema = requiredString("Customer Name")
export const addressSchema = z.string()
export const npwpSchema = z.string()
export const customerShipmentTypesSchema = z
  .array(z.enum(["EXPORT", "IMPORT", "DOMESTIC"]))
  .min(1, "Shipment Type is required")

export const customerFormSchema = z.object({
  customerCode: customerCodeSchema,
  customerName: customerNameSchema,
  npwp: npwpSchema,
  address: addressSchema,
  shipmentTypes: customerShipmentTypesSchema,
  isActive: z.boolean(),
})

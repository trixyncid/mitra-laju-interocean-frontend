import {
  requiredFormNumberSchema,
  requiredPercentageSchema,
  requiredString,
  selectNotDashSchema,
} from "./common"
import { z } from "zod"
import { costingCurrencyRequiresRate } from "@/lib/costing-currencies"

export const costingNumberSchema = requiredString("Costing Number")
export const costingDescriptionSchema = requiredString("Description")
export const costingPriceSchema = requiredFormNumberSchema("Price")
export const costingCurrencyCodeSchema = z.enum(["IDR", "USD"], {
  message: "Currency is required",
})
export const costingCurrencyRateSchema = requiredFormNumberSchema("Currency rate")
export const costingCurrencySchema = costingCurrencyRateSchema

export function costingCurrencyRateForCodeSchema(currencyCode: string) {
  if (!costingCurrencyRequiresRate(currencyCode)) {
    return z.union([z.string(), z.number()]).optional()
  }

  return costingCurrencyRateSchema
}
export const costingContainerSchema = selectNotDashSchema("Container")
export const costingVatSchema = requiredPercentageSchema("VAT")
export const costingPph23Schema = requiredPercentageSchema("PPH 23")
export const costingVendorInvoiceSchema = requiredString("Vendor Invoice Number")
export const costingVendorSchema = selectNotDashSchema("Vendor")

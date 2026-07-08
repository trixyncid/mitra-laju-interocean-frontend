import {
  requiredFormNumberSchema,
  requiredPercentageSchema,
  requiredString,
  selectNotDashSchema,
} from "./common"

export const costingNumberSchema = requiredString("Costing Number")
export const costingDescriptionSchema = requiredString("Description")
export const costingPriceSchema = requiredFormNumberSchema("Price")
export const costingCurrencySchema = requiredFormNumberSchema("Currency")
export const costingContainerSchema = selectNotDashSchema("Container")
export const costingVatSchema = requiredPercentageSchema("VAT")
export const costingPph23Schema = requiredPercentageSchema("PPH 23")
export const costingVendorInvoiceSchema = requiredString("Vendor Invoice Number")
export const costingVendorSchema = selectNotDashSchema("Vendor")

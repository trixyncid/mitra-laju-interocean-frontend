import {
  requiredFormNumberSchema,
  requiredPercentageSchema,
  requiredString,
  selectNotDashSchema,
} from "./common"
import { z } from "zod"

export const costingVendorSchema = selectNotDashSchema("Vendor")
export const costingVatSchema = requiredPercentageSchema("VAT")
export const costingPph23Schema = requiredPercentageSchema(
  "PPH 23",
  "PPH 23 must be ≤ 100"
)
/** Invoice tax on a costing breakdown line. */
export const costingBreakdownVatSchema = requiredPercentageSchema(
  "VAT",
  "VAT must be ≤ 100"
)
export const costingBreakdownPph23Schema = requiredPercentageSchema(
  "PPH 23",
  "PPH 23 must be ≤ 100"
)
/** Customer-side tax on a shipment-linked costing line. */
export const costingSellingVatSchema = requiredPercentageSchema(
  "Selling VAT",
  "Selling VAT must be ≤ 100"
)
export const costingSellingPph23Schema = requiredPercentageSchema(
  "Selling PPH 23",
  "Selling PPH 23 must be ≤ 100"
)
export const costingSellingAmountSchema = requiredFormNumberSchema("Selling amount")
export const costingVendorInvoiceSchema = z.string().optional()
export const costingVendorVesselSchema = z.string().optional()
export const costingVendorInvoiceTypeSchema = z.enum([
  "INVOICE",
  "REIMBURSEMENT",
])
export const costingProductDescriptionSchema = requiredString("Product / charge")
export const costingQuantitySchema = z.coerce
  .number()
  .int()
  .positive("Quantity must be at least 1")
export const costingPriceSchema = requiredFormNumberSchema("Unit price")
export const costingCurrencyPriceSchema = requiredFormNumberSchema("Exchange rate")
export const costingContainerSchema = z.string().optional()
export const costingMonthSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(12)
export const costingYearSchema = z.coerce.number().int().min(2000)

export const costingBreakdownFormSchema = z.object({
  productDescription: costingProductDescriptionSchema,
  quantity: costingQuantitySchema,
  price: costingPriceSchema,
  currencyPrice: costingCurrencyPriceSchema,
  containerNumber: costingContainerSchema,
  containerSizeId: z.string().optional(),
  containerTypeId: z.string().optional(),
  shipmentId: z.string().optional(),
  vatPercentage: costingBreakdownVatSchema,
  pph23Percentage: costingBreakdownPph23Schema,
})

export type CostingBreakdownFormValues = z.infer<typeof costingBreakdownFormSchema>

export const costingCreateLineSchema = z.object({
  key: z.string(),
  productDescription: costingProductDescriptionSchema,
  quantity: costingQuantitySchema,
  price: costingPriceSchema,
  currencyPrice: costingCurrencyPriceSchema,
  containerNumber: z.string().optional(),
  containerSizeId: z.string().optional(),
  containerTypeId: z.string().optional(),
  vatPercentage: costingVatSchema,
  pph23Percentage: costingPph23Schema,
})

export const costingCreateFormSchema = z.object({
  month: costingMonthSchema,
  year: costingYearSchema,
  vendorId: costingVendorSchema,
  vendorInvoiceType: costingVendorInvoiceTypeSchema,
  vendorInvoiceNumber: z.string(),
  vendorInvoiceDate: z.string(),
  vendorVessel: z.string(),
  paymentDate: z.string(),
  breakdowns: z
    .array(costingCreateLineSchema)
    .min(1, "Add at least one line item"),
})

export type CostingCreateFormValues = z.infer<typeof costingCreateFormSchema>

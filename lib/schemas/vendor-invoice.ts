import {
  requiredFormNumberSchema,
  requiredPercentageSchema,
  requiredString,
  selectNotDashSchema,
} from "./common"
import { z } from "zod"

export const vendorInvoiceVendorSchema = selectNotDashSchema("Vendor")
export const vendorInvoiceVatSchema = requiredPercentageSchema("VAT")
export const vendorInvoicePph23Schema = requiredPercentageSchema(
  "PPH 23",
  "PPH 23 must be ≤ 100"
)
/** Invoice tax on a vendor invoice breakdown line. */
export const vendorInvoiceBreakdownVatSchema = requiredPercentageSchema(
  "VAT",
  "VAT must be ≤ 100"
)
export const vendorInvoiceBreakdownPph23Schema = requiredPercentageSchema(
  "PPH 23",
  "PPH 23 must be ≤ 100"
)
export const vendorInvoiceNumberSchema = requiredString("Vendor invoice number")
export const vendorInvoiceVendorVesselSchema = z.string().optional()
export const vendorInvoiceVendorInvoiceTypeSchema = z.enum([
  "INVOICE",
  "REIMBURSEMENT",
])
export const vendorInvoiceProductDescriptionSchema = requiredString("Product / charge")
export const vendorInvoiceQuantitySchema = z.coerce
  .number()
  .int()
  .positive("Quantity must be at least 1")
export const vendorInvoicePriceSchema = requiredFormNumberSchema("Unit price")
export const vendorInvoiceCurrencyPriceSchema = requiredFormNumberSchema("Exchange rate")
export const vendorInvoiceContainerSchema = z.string().optional()

export const vendorInvoiceBreakdownFormSchema = z.object({
  productDescription: vendorInvoiceProductDescriptionSchema,
  quantity: vendorInvoiceQuantitySchema,
  price: vendorInvoicePriceSchema,
  currencyPrice: vendorInvoiceCurrencyPriceSchema,
  containerNumber: vendorInvoiceContainerSchema,
  containerSizeId: z.string().optional(),
  containerTypeId: z.string().optional(),
  vatPercentage: vendorInvoiceBreakdownVatSchema,
  pph23Percentage: vendorInvoiceBreakdownPph23Schema,
})

export type VendorInvoiceBreakdownFormValues = z.infer<typeof vendorInvoiceBreakdownFormSchema>

export const vendorInvoiceCreateLineSchema = z.object({
  key: z.string(),
  productDescription: vendorInvoiceProductDescriptionSchema,
  quantity: vendorInvoiceQuantitySchema,
  price: vendorInvoicePriceSchema,
  currencyPrice: vendorInvoiceCurrencyPriceSchema,
  containerNumber: z.string().optional(),
  containerSizeId: z.string().optional(),
  containerTypeId: z.string().optional(),
  vatPercentage: vendorInvoiceVatSchema,
  pph23Percentage: vendorInvoicePph23Schema,
})

export const vendorInvoiceCreateFormSchema = z.object({
  vendorId: vendorInvoiceVendorSchema,
  vendorInvoiceType: vendorInvoiceVendorInvoiceTypeSchema,
  vendorInvoiceNumber: vendorInvoiceNumberSchema,
  vendorInvoiceDate: z.string(),
  vendorVessel: z.string(),
  paymentDate: z.string(),
  breakdowns: z
    .array(vendorInvoiceCreateLineSchema)
    .min(1, "Add at least one line item"),
})

export type VendorInvoiceCreateFormValues = z.infer<typeof vendorInvoiceCreateFormSchema>

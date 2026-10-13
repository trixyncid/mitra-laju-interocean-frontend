export const VENDOR_INVOICE_CURRENCIES = [
  { code: "IDR", name: "Indonesian Rupiah", requiresRate: false },
  { code: "USD", name: "US Dollar", requiresRate: true },
] as const

export type VendorInvoiceCurrencyCode = (typeof VENDOR_INVOICE_CURRENCIES)[number]["code"]

export const DEFAULT_VENDOR_INVOICE_CURRENCY_CODE: VendorInvoiceCurrencyCode = "IDR"

export function vendorInvoiceCurrencyRequiresRate(code: string) {
  return code !== "IDR"
}

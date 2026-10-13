export const VENDOR_INVOICE_CURRENCIES = [
  { code: "USD", label: "US Dollar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "SGD", label: "Singapore Dollar (SGD)" },
  { code: "IDR", label: "Indonesian Rupiah (IDR)" },
  { code: "CNY", label: "Chinese Yuan (CNY)" },
  { code: "JPY", label: "Japanese Yen (JPY)" },
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "AUD", label: "Australian Dollar (AUD)" },
  { code: "HKD", label: "Hong Kong Dollar (HKD)" },
] as const

export type VendorInvoiceCurrencyCode = (typeof VENDOR_INVOICE_CURRENCIES)[number]["code"]

export const DEFAULT_VENDOR_INVOICE_CURRENCY_CODE: VendorInvoiceCurrencyCode = "USD"

export function isIdrCurrency(code: string) {
  return code === "IDR"
}

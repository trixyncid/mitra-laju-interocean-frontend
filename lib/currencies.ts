export const COSTING_CURRENCIES = [
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

export type CostingCurrencyCode = (typeof COSTING_CURRENCIES)[number]["code"]

export const DEFAULT_COSTING_CURRENCY_CODE: CostingCurrencyCode = "USD"

export function isIdrCurrency(code: string) {
  return code === "IDR"
}

export const COSTING_CURRENCIES = [
  { code: "IDR", name: "Indonesian Rupiah", requiresRate: false },
  { code: "USD", name: "US Dollar", requiresRate: true },
] as const

export type CostingCurrencyCode = (typeof COSTING_CURRENCIES)[number]["code"]

export const DEFAULT_COSTING_CURRENCY_CODE: CostingCurrencyCode = "IDR"

export function costingCurrencyRequiresRate(code: string) {
  return code !== "IDR"
}

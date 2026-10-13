/**
 * Vendor invoice, costing, and selling can be enabled independently.
 */
export const VENDOR_INVOICE_MODULE_ENABLED = true
export const COSTING_MODULE_ENABLED = true
/** Selling lines (what is charged to customers), optionally backed by costings. */
export const SELLING_MODULE_ENABLED = true
/** Sales jobs group a shipment (or nothing) with its costings and sellings. */
export const SALES_MODULE_ENABLED = true
/** Customer invoices bill a sales job's selling lines (sales → selling → invoice). */
export const CUSTOMER_INVOICE_MODULE_ENABLED = true
// The old per-shipment invoice screens target the previous model, so they stay off.
export const LEGACY_INVOICE_SCREENS_ENABLED = false

/** True when any financial module is visible. */
export const FINANCIAL_MODULES_ENABLED =
  VENDOR_INVOICE_MODULE_ENABLED || COSTING_MODULE_ENABLED || SELLING_MODULE_ENABLED || SALES_MODULE_ENABLED || CUSTOMER_INVOICE_MODULE_ENABLED

export function isFinancialModule(module: string) {
  return module === "VENDOR_INVOICE" || module === "COSTING" || module === "SELLING" || module === "SALES" || module === "CUSTOMER_INVOICE"
}

export function isModuleEnabled(module: string) {
  if (module === "VENDOR_INVOICE") return VENDOR_INVOICE_MODULE_ENABLED
  if (module === "COSTING") return COSTING_MODULE_ENABLED
  if (module === "SELLING") return SELLING_MODULE_ENABLED
  if (module === "SALES") return SALES_MODULE_ENABLED
  if (module === "CUSTOMER_INVOICE") return CUSTOMER_INVOICE_MODULE_ENABLED
  return true
}

/** "How the business is doing" on the overview (profit, cash, money leaks). Hidden for now. */
export const BUSINESS_OVERVIEW_ENABLED = false

/**
 * Costing and invoices (selling) can be enabled independently.
 * Both are hidden for now.
 */
export const COSTING_MODULE_ENABLED = false
export const SELLING_MODULE_ENABLED = false

/** True when either financial module is visible. */
export const FINANCIAL_MODULES_ENABLED =
  COSTING_MODULE_ENABLED || SELLING_MODULE_ENABLED

export function isFinancialModule(module: string) {
  return module === "COSTING" || module === "SELLING"
}

export function isModuleEnabled(module: string) {
  if (module === "COSTING") return COSTING_MODULE_ENABLED
  if (module === "SELLING") return SELLING_MODULE_ENABLED
  return true
}

/**
 * Costing and selling can be enabled independently.
 */
export const COSTING_MODULE_ENABLED = true
export const SELLING_MODULE_ENABLED = true

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

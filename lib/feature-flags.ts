/**
 * Flip to `true` to show costing and selling in navigation, dashboards,
 * shipment details, and customer/vendor records.
 */
export const FINANCIAL_MODULES_ENABLED = false

export function isFinancialModule(module: string) {
  return module === "COSTING" || module === "SELLING"
}

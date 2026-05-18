export type ShipmentType = "EXPORT" | "IMPORT" | "DOMESTIC"

export const SHIPMENT_TYPES: ShipmentType[] = ["EXPORT", "IMPORT", "DOMESTIC"]

export function totalShipmentCount(counts: Record<ShipmentType, number>) {
  return SHIPMENT_TYPES.reduce((sum, type) => sum + (counts[type] ?? 0), 0)
}

export interface DashboardDateRange {
  startDate: string
  endDate: string
}

export interface DashboardCustomerByShipments {
  customerId: string
  customerName: string
  customerCode: string
  shipmentCount: number
}

export interface DashboardCustomerByCharge {
  customerId: string
  customerName: string
  customerCode: string
  totalChargeAmount: number
}

export interface DashboardVendorByCosting {
  vendorId: string
  vendorName: string
  vendorCode: string
  costingCount: number
}

export interface DashboardVendorByAmount {
  vendorId: string
  vendorName: string
  vendorCode: string
  totalAmount: string
}

export interface DashboardData {
  dateRange: DashboardDateRange
  shipmentTypeCounts: Record<ShipmentType, number>
  topCustomersByShipments: DashboardCustomerByShipments[]
  topCustomersByChargeAmount: DashboardCustomerByCharge[]
  topVendorsByCostingCount: DashboardVendorByCosting[]
  topVendorsByTotalAmount: DashboardVendorByAmount[]
  totalNetSelling: string
  totalNetCosting: string
  netRevenue: string
}

export interface DashboardQueryParams {
  startDate?: string
  endDate?: string
}

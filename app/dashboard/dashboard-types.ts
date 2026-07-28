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

export interface DashboardCustomerBySellingAmount {
  customerId: string
  customerName: string
  customerCode: string
  totalSellingAmount: string
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
  topCustomersBySellingAmount: DashboardCustomerBySellingAmount[]
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

export type VoyageStatus = "ongoing" | "completed"

export interface DashboardVoyageShipment {
  id: string
  orderNumber: string
  eta: string | null
  shipmentType: ShipmentType
  customerName: string
  customerCode: string
  portDeparture: string | null
  portDestination: string | null
}

export interface DashboardVoyageGroup {
  vesselId: string
  vesselName: string
  voyageNumber: string
  etd: string | null
  shipments: DashboardVoyageShipment[]
}

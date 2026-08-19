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

export type ShipmentStatusCountKey = "DRAFT" | "BACKUP" | "ONGOING" | "FINISHED"

export interface DashboardNamedCount {
  name: string
  count: number
}

export interface DashboardContainerStats {
  total: number
  teu: number
  bySize: DashboardNamedCount[]
  byType: DashboardNamedCount[]
}

export interface DashboardWeeklyVolume {
  weekStart: string
  EXPORT: number
  IMPORT: number
  DOMESTIC: number
  containers: number
}

export interface DashboardData {
  dateRange: DashboardDateRange
  shipmentTypeCounts: Record<ShipmentType, number>
  shipmentStatusCounts: Record<ShipmentStatusCountKey, number>
  finishedInPeriod: number
  containerStats: DashboardContainerStats
  weeklyVolume: DashboardWeeklyVolume[]
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

export type VoyageStatus = "draft" | "backup" | "ongoing"

export interface DashboardVoyageContainer {
  containerNumber: string | null
  sealNumber: string | null
  containerSize: { name: string } | null
  containerType: { name: string } | null
}

export interface DashboardVoyageShipment {
  id: string
  orderNumber: string
  shipmentType: ShipmentType
  customerName: string
  customerCode: string
  customerShipper: string | null
  portDeparture: string | null
  portDestination: string | null
  bookingNumber: string | null
  blNumber: string | null
  containers: DashboardVoyageContainer[]
}

export interface DashboardVoyageGroup {
  vesselId: string
  vesselName: string
  voyageNumber: string
  etd: string | null
  shipments: DashboardVoyageShipment[]
}

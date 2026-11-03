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

export interface DashboardVendorByVendorInvoice {
  vendorId: string
  vendorName: string
  vendorCode: string
  vendorInvoiceCount: number
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
  topVendorsByVendorInvoiceCount: DashboardVendorByVendorInvoice[]
  topVendorsByTotalAmount: DashboardVendorByAmount[]
  totalNetVendorInvoice: string
}

export interface DashboardQueryParams {
  startDate?: string
  endDate?: string
}

export type VoyageStatus = "draft" | "backup" | "ongoing" | "finished"

export interface DashboardVoyageContainer {
  containerNumber: string | null
  sealNumber: string | null
  containerSize: { name: string } | null
  containerType: { name: string } | null
}

export interface DashboardVoyageShipment {
  id: string
  shipmentType: ShipmentType
  customerName: string
  customerCode: string
  customerShipper: string | null
  portDeparture: string | null
  portDestination: string | null
  bookingNumber: string | null
  blNumber: string | null
  /** Service lines; `vendor` is "Name (CODE)". */
  services: { serviceName: string; vendor: string | null }[]
  remarks: string | null
  containers: DashboardVoyageContainer[]
}

export interface DashboardVoyageGroup {
  vesselId: string
  vesselName: string
  voyageNumber: string
  etd: string | null
  shipments: DashboardVoyageShipment[]
}

/** Before-tax totals for the sales jobs created in a period. */
export interface BusinessTotals {
  jobs: number
  revenue: string
  cost: string
  profit: string
  /** Percent of revenue, null when there is no revenue. */
  margin: number | null
}

export type BusinessJobHealth = "healthy" | "thin" | "loss" | "nothing"

export interface BusinessAgingBucket {
  key: string
  label: string
  invoices: number
  amount: string
}

export interface BusinessData {
  generatedAt: string
  range: { start: string; end: string }
  profit: {
    current: BusinessTotals
    previous: BusinessTotals
    trend: {
      granularity: "week" | "month"
      points: { start: string; jobs: number; revenue: string; cost: string; profit: string }[]
    }
    health: {
      counts: Record<BusinessJobHealth, number>
      needsReview: {
        id: string
        salesNumber: string
        customerName: string | null
        health: BusinessJobHealth
        profit: string
        margin: number | null
      }[]
    }
    customers: {
      customerId: string
      customerName: string
      customerCode: string
      jobs: number
      revenue: string
      profit: string
      margin: number | null
    }[]
  } | null
  receivables: {
    outstanding: string
    invoices: number
    aging: BusinessAgingBucket[]
    billed: string
    billedInvoices: number
    collected: string
    collectedInvoices: number
    averageDaysToCollect: number | null
  } | null
  payables: {
    outstanding: string
    invoices: number
    aging: BusinessAgingBucket[]
    paid: string
    paidInvoices: number
  } | null
  attention: {
    costsNotCharged: { count: number; amount: string } | null
    readyToBill: { count: number; amount: string } | null
    finishedNotInvoiced: number | null
    unmatchedVendorLines: { lines: number; amount: string } | null
    looseCostings: number | null
    looseSellings: number | null
    overdueArrivals: number | null
  }
}

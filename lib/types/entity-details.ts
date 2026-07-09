import type { Costing } from "@/app/dashboard/costings/columns"
import type { Customer } from "@/app/dashboard/customers/columns"
import type { Selling } from "@/app/dashboard/sellings/columns"
import type { Shipment } from "@/app/dashboard/shipments/columns"
import type { Vendor } from "@/app/dashboard/vendors/columns"

export type CustomerContact = {
  id: string
  contactName: string
  phoneNumber: string
  email: string
  isActive: boolean
}

export type CustomerLocation = {
  id: string
  addressLine1: string
  addressLine2: string
  addressLine3: string
  city: string
  province: string
  country: string
  postalCode: string
  customerContacts: CustomerContact[]
  updatedAt: string
  updatedBy: { name: string }
}

export type CustomerShipper = {
  id: string
  name: string
  phoneNumber: string
  country: string
  isActive: boolean
  customerLocations: CustomerLocation[]
  updatedAt: string
  updatedBy: string
}

export type CustomerShipment = {
  id: string
  orderNumber: string
  customerCode: { customerName: string; customerCode: string }
  customerShipper: { name: string }
  shipmentOperational: {
    portDeparture: { portCountry: string }
    portDestination: { portCountry: string }
    eta: string
    status?: string
    customerChargeAmount?: number
  } | null
  costings: Costing[]
  isActive: boolean
}

export type CustomerDetail = Customer & {
  id: string
  createdAt: string
  updatedAt: string
  updatedBy: { name: string }
  customerShippers: CustomerShipper[]
  shipments: CustomerShipment[]
}

export type VendorContact = {
  id: string
  contactName: string
  phoneNumber: string
  email: string
  isActive: boolean
}

export type VendorLocation = {
  id: string
  addressLine1: string
  addressLine2: string
  addressLine3: string
  city: string
  province: string
  country: string
  postalCode: string
  vendorContacts: VendorContact[]
  updatedAt: string
  updatedBy: { name: string }
}

export type VendorDetail = Vendor & {
  id: string
  createdAt: string
  updatedAt: string
  updatedBy: { name: string }
  vendorLocations: VendorLocation[]
  costings: Costing[]
}

export type SellingLinkedCosting = {
  id: string
  costingNumber: string
  description: string
  price: number
  currency: number
  vatPercentage: number
  pph23Percentage: number
  vendor: { vendorName: string }
}

export type SellingDetail = Selling & {
  updatedAt: string
  updatedBy: { name: string }
  costings?: SellingLinkedCosting[]
}

export type ShipmentOperationalContainer = {
  id?: string
  containerNumber: string
  sealNumber: string
  size: string
  isActive: boolean
  updatedAt: string
  updatedBy: { name: string }
}

export type ShipmentOperationalAttachment = {
  id?: string
  attachmentName: string
  filePath: string
  fileName: string
  contentType: string
  size: number
  updatedAt: string
  updatedBy: { name: string }
}

export type ShipmentLinkedSelling = {
  id: string
  sellingNumber: string
  description: string
  amount: number
  vatPercentage: number
  pph23Percentage: number
  status: string
  updatedAt?: string
}

export type ShipmentOperationalDetail = {
  id: string
  shipmentType: string
  portDepartureId: string
  portDestinationId: string
  loadingLocationId: string
  unloadingLocationId: string
  blNumber: string | null
  bookingNumber: string | null
  vesselId: string
  eta: string | null
  customerChargeAmount: number | null
  status: string
  updatedAt: string
  updatedBy: { name: string }
  portDeparture: { portName: string; portCountry: string }
  portDestination: { portName: string; portCountry: string }
  vessel: { vesselName: string; voyageNumber: string }
  shipmentOperationalContainers: ShipmentOperationalContainer[]
}

export type ShipmentDetail = Shipment & {
  id: string
  customerCode: { customerName: string; customerCode: string }
  customerShipper: { name: string }
  shipmentOperational: ShipmentOperationalDetail | null
  shipmentOperationalAttachments: ShipmentOperationalAttachment[]
  costings: Costing[]
  sellings: ShipmentLinkedSelling[]
}

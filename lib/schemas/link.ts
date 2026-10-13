import { requiredSelectionSchema } from "./common"

export const vendorInvoiceSelectionSchema = requiredSelectionSchema("Please select a vendor invoice")
export const sellingSelectionSchema = requiredSelectionSchema("Please select a selling")
export const shipmentSelectionSchema = requiredSelectionSchema("Please select a shipment")

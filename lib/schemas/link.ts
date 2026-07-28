import { requiredSelectionSchema } from "./common"

export const costingSelectionSchema = requiredSelectionSchema("Please select a costing")
export const sellingSelectionSchema = requiredSelectionSchema("Please select a selling")
export const shipmentSelectionSchema = requiredSelectionSchema("Please select a shipment")

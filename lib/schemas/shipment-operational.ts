import { z } from "zod"
import { selectRequiredSchema } from "./common"

export const shipmentTypeFieldSchema = selectRequiredSchema("Shipment Type")
export const vesselIdSchema = selectRequiredSchema("Vessel")
export const portDepartureIdSchema = selectRequiredSchema("Port of Loading")
export const portDestinationIdSchema = selectRequiredSchema("Port of Discharge")
export const loadingLocationIdSchema = z.string()
export const unloadingLocationIdSchema = z.string()

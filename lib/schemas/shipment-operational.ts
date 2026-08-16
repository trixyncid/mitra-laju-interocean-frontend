import { z } from "zod"
import { selectRequiredSchema } from "./common"

export const shipmentTypeFieldSchema = selectRequiredSchema("Shipment Type")
export const vesselIdSchema = selectRequiredSchema("Vessel")
export const portDepartureIdSchema = z.string()
export const portDestinationIdSchema = z.string()
export const loadingLocationIdSchema = z.string()
export const unloadingLocationIdSchema = z.string()
export const truckingBookToIdSchema = z.string()
export const freightBookToIdSchema = z.string()

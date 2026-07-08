import { selectRequiredSchema } from "./common"

export const shipmentTypeFieldSchema = selectRequiredSchema("Shipment Type")
export const vesselIdSchema = selectRequiredSchema("Vessel")
export const portDepartureIdSchema = selectRequiredSchema("Port Departure")
export const portDestinationIdSchema = selectRequiredSchema("Port Destination")
export const loadingLocationIdSchema = selectRequiredSchema("Loading Location")
export const unloadingLocationIdSchema = selectRequiredSchema("Unloading Location")

import { requiredString } from "./common"
import { z } from "zod"

export const vesselNameSchema = requiredString("Vessel Name")
export const voyageNumberSchema = requiredString("Voyage Number")

export const vesselFormSchema = z.object({
  vesselName: vesselNameSchema,
  voyageNumber: voyageNumberSchema,
  etd: z.string(),
  eta: z.string(),
  closingReefer: z.string(),
  isActive: z.boolean(),
})

/** Error for an ETA that falls before the ETD (both "yyyy-MM-dd", so they compare as text). */
export function etaBeforeEtdError(etd: string, eta: string) {
  return etd && eta && eta < etd ? "ETA cannot be before ETD" : undefined
}

import { requiredString } from "./common"
import { z } from "zod"

export const vesselNameSchema = requiredString("Vessel Name")
export const voyageNumberSchema = requiredString("Voyage Number")

export const vesselFormSchema = z.object({
  vesselName: vesselNameSchema,
  voyageNumber: voyageNumberSchema,
  etd: z.string(),
  closingReefer: z.string(),
  isActive: z.boolean(),
})

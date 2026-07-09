import { requiredString } from "./common"
import { z } from "zod"

export const shipperNameSchema = requiredString("Name")
export const shipperPhoneSchema = z.string()
export const shipperCountrySchema = z.string()

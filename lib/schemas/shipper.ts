import { requiredString } from "./common"

export const shipperNameSchema = requiredString("Name")
export const shipperPhoneSchema = requiredString("Phone Number")
export const shipperCountrySchema = requiredString("Country")

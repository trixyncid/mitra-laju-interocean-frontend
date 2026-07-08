import { requiredString } from "./common"

export const addressLine1Schema = requiredString("Address Line 1")
export const citySchema = requiredString("City")
export const provinceSchema = requiredString("Province / State")
export const locationCountrySchema = requiredString("Country")

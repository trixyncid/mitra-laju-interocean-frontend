import { requiredString, selectNotDashSchema, selectRequiredSchema } from "./common"

export const orderNumberSchema = requiredString("Order Number")
export const customerCodeIdSchema = selectRequiredSchema("Customer Code")
export const customerShipperIdSchema = selectNotDashSchema("Customer Shipper")

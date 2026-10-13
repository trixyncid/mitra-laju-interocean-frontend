import { selectNotDashSchema, selectRequiredSchema } from "./common"

export const customerCodeIdSchema = selectRequiredSchema("Customer Code")
export const customerShipperIdSchema = selectNotDashSchema("Customer Shipper")

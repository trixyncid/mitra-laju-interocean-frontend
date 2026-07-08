import {
  requiredFormNumberSchema,
  requiredPercentageSchema,
  requiredString,
} from "./common"

export const sellingDescriptionSchema = requiredString("Description")
export const sellingAmountSchema = requiredFormNumberSchema("Amount")
export const sellingVatSchema = requiredPercentageSchema("VAT", "VAT must be ≤ 100")
export const sellingPph23Schema = requiredPercentageSchema("PPH 23", "PPH 23 must be ≤ 100")

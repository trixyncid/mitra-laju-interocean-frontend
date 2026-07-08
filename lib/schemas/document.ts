import { requiredFileSchema, requiredString } from "./common"

export const attachmentNameSchema = requiredString("Document Name")
export { requiredFileSchema as documentFileSchema }

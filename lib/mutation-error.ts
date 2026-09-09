import { toast } from "sonner"

import { isUnauthorizedError } from "@/lib/api-client"

export function toastMutationError(error: Error) {
  if (isUnauthorizedError(error)) return
  toast.error(error.message)
}

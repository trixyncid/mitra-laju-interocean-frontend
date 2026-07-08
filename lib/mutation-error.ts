import { toast } from "sonner"

export function toastMutationError(error: Error) {
  toast.error(error.message)
}

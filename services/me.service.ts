import { apiClient } from "@/lib/api-client"
import type { MyPermissions } from "@/lib/permissions"

export const meService = {
  getPermissions: async (): Promise<MyPermissions> =>
    apiClient.get("/me/permissions"),
}

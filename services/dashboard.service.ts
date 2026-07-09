import type {
  DashboardData,
  DashboardQueryParams,
  DashboardVoyageGroup,
  VoyageStatus,
} from "@/app/dashboard/dashboard-types"
import { apiClient } from "@/lib/api-client"

export const dashboardService = {
  get: async (params?: DashboardQueryParams): Promise<DashboardData> => {
    const searchParams = new URLSearchParams()
    if (params?.startDate) searchParams.set("startDate", params.startDate)
    if (params?.endDate) searchParams.set("endDate", params.endDate)

    const query = searchParams.toString()
    return apiClient.get(`/dashboard${query ? `?${query}` : ""}`)
  },
  getShipmentsByVoyage: async (
    voyageStatus: VoyageStatus = "ongoing"
  ): Promise<DashboardVoyageGroup[]> => {
    const query = new URLSearchParams({ voyageStatus })
    return apiClient.get(`/dashboard/shipments-by-voyage?${query.toString()}`)
  },
}

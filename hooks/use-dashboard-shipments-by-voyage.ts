import { useQuery } from "@tanstack/react-query"

import type { VoyageStatus } from "@/app/dashboard/dashboard-types"
import { dashboardService } from "@/services/dashboard.service"

export const useDashboardShipmentsByVoyage = (
  voyageStatus: VoyageStatus = "ongoing",
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["dashboard", "shipments-by-voyage", voyageStatus],
    queryFn: () => dashboardService.getShipmentsByVoyage(voyageStatus),
    enabled: options?.enabled ?? true,
  })
}

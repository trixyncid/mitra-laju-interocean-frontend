import { useQuery } from "@tanstack/react-query"

import type { DashboardQueryParams } from "@/app/dashboard/dashboard-types"
import { dashboardService } from "@/services/dashboard.service"

export const useDashboard = (params?: DashboardQueryParams) => {
  return useQuery({
    queryKey: ["dashboard", params?.startDate, params?.endDate],
    queryFn: () => dashboardService.get(params),
  })
}

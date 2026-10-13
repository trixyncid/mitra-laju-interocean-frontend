import { useQuery } from "@tanstack/react-query"

import type { DashboardQueryParams } from "@/app/dashboard/dashboard-types"
import { dashboardService } from "@/services/dashboard.service"

export const useDashboard = (
  params?: DashboardQueryParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["dashboard", params?.startDate, params?.endDate],
    queryFn: () => dashboardService.get(params),
    enabled: options?.enabled ?? true,
  })
}

/** Profit, cash and money leaks for the overview. */
export const useBusinessOverview = (params?: DashboardQueryParams, enabled = true) => {
  return useQuery({
    queryKey: ["dashboard", "business", params?.startDate, params?.endDate],
    queryFn: () => dashboardService.getBusiness(params),
    enabled,
  })
}

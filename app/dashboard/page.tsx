"use client"

import { format, subDays } from "date-fns"
import { useMemo, useState } from "react"

import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards"
import { DashboardRankings } from "@/components/dashboard/dashboard-rankings"
import { DashboardShipmentChart } from "@/components/dashboard/dashboard-shipment-chart"
import { DashboardShipmentVolumeChart } from "@/components/dashboard/dashboard-shipment-volume-chart"
import { DashboardShipmentsByVoyage } from "@/components/dashboard/dashboard-shipments-by-voyage"
import ErrorPage from "@/components/error-page"
import {
  DashboardPage,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import DashboardSkeleton from "@/components/loading/dashboard-skeleton"
import {
  DateRangePicker,
  type TableDateRange,
} from "@/components/ui/date-range-picker"
import { useDashboard } from "@/hooks/use-dashboard"
import { localDate } from "@/lib/utils"

function getDefaultDashboardDateRange(): TableDateRange {
  const end = new Date()
  const start = subDays(end, 30)

  return {
    from: format(start, "yyyy-MM-dd"),
    to: format(end, "yyyy-MM-dd"),
  }
}

export default function DashboardHomePage() {
  const defaultDateRange = useMemo(() => getDefaultDashboardDateRange(), [])
  const [dateRange, setDateRange] = useState<TableDateRange>(defaultDateRange)

  const queryParams = useMemo(
    () => ({
      startDate: dateRange.from,
      endDate: dateRange.to,
    }),
    [dateRange.from, dateRange.to]
  )

  const { data, isLoading, error } = useDashboard(queryParams)

  if (error) {
    return (
      <ErrorPage
        title="Failed to load dashboard"
        message={error.message || "Could not fetch analytics. Please try again."}
      />
    )
  }

  const periodLabel = data?.dateRange
    ? `${localDate(data.dateRange.startDate)} – ${localDate(data.dateRange.endDate)}`
    : dateRange.from && dateRange.to
      ? `${format(new Date(`${dateRange.from}T12:00:00`), "dd MMM yyyy")} – ${format(new Date(`${dateRange.to}T12:00:00`), "dd MMM yyyy")}`
      : "selected period"

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Dashboard"
        description={`Overview for ${periodLabel}. KPI totals use net selling and costing amounts (after VAT & PPH23); customer selling rankings use gross selling amounts per the API.`}
        action={
          <DateRangePicker
            label="Period"
            value={dateRange}
            onChange={(next) => {
              if (!next.from && !next.to) {
                setDateRange(defaultDateRange)
                return
              }
              setDateRange(next)
            }}
          />
        }
      />

      <DashboardShipmentsByVoyage />

      {isLoading || !data ? (
        <DashboardSkeleton />
      ) : (
        <div className="mt-8 min-w-0 space-y-8">
          <DashboardKpiCards data={data} />

          <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
            <DashboardShipmentChart data={data} />
            <DashboardShipmentVolumeChart data={data} />
          </div>
          <DashboardRankings data={data} />
        </div>
      )}
    </DashboardPage>
  )
}

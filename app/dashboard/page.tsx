"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"

import { DashboardDateRange, getDateRangeFromPreset, type DateRangePreset } from "@/components/dashboard/dashboard-date-range"
import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards"
import { DashboardRankings } from "@/components/dashboard/dashboard-rankings"
import { DashboardShipmentChart } from "@/components/dashboard/dashboard-shipment-chart"
import { DashboardShipmentVolumeChart } from "@/components/dashboard/dashboard-shipment-volume-chart"
import ErrorPage from "@/components/error-page"
import {
  DashboardPage,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import DashboardSkeleton from "@/components/loading/dashboard-skeleton"
import { useDashboard } from "@/hooks/use-dashboard"
import { localDate } from "@/lib/utils"

export default function DashboardHomePage() {
  const [preset, setPreset] = useState<DateRangePreset>("30")
  const defaultRange = useMemo(() => getDateRangeFromPreset("30"), [])
  const [startDate, setStartDate] = useState(defaultRange.startDate!)
  const [endDate, setEndDate] = useState(defaultRange.endDate!)

  const queryParams = useMemo(
    () => ({ startDate, endDate }),
    [startDate, endDate]
  )

  const { data, isLoading, error } = useDashboard(queryParams)

  const handlePresetChange = (next: DateRangePreset) => {
    setPreset(next)
    if (next !== "custom") {
      const range = getDateRangeFromPreset(next)
      setStartDate(range.startDate!)
      setEndDate(range.endDate!)
    }
  }

  if (error) {
    return (
      <ErrorPage
        title="Failed to load dashboard"
        message={error.message || "Could not fetch analytics. Please try again."}
      />
    )
  }

  const periodLabel =
    data?.dateRange
      ? `${localDate(data.dateRange.startDate)} – ${localDate(data.dateRange.endDate)}`
      : `${format(new Date(`${startDate}T12:00:00`), "dd MMM yyyy")} – ${format(new Date(`${endDate}T12:00:00`), "dd MMM yyyy")}`

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Dashboard"
        description={`Overview for ${periodLabel}. KPI totals use net selling and costing amounts (after VAT & PPH23); customer selling rankings use gross selling amounts per the API.`}
        action={
          <DashboardDateRange
            preset={preset}
            startDate={startDate}
            endDate={endDate}
            onPresetChange={handlePresetChange}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        }
      />

      {isLoading || !data ? (
        <DashboardSkeleton />
      ) : (
        <div className="min-w-0 space-y-8">
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

"use client"

import { format, subDays } from "date-fns"
import { useMemo, useState } from "react"
import { motion } from "motion/react"

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

  return (
    <DashboardPage atmosphere>
      <DashboardPageHeader
        className="mb-8 lg:mb-10"
        title="Operations overview"
        description="Net figures are after VAT & PPH23."
        action={
          <DateRangePicker
            layout="inline"
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
        <div className="mt-8 min-w-0 space-y-6 lg:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <DashboardKpiCards data={data} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2"
          >
            <DashboardShipmentChart data={data} />
            <DashboardShipmentVolumeChart data={data} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            <DashboardRankings data={data} />
          </motion.div>
        </div>
      )}
    </DashboardPage>
  )
}

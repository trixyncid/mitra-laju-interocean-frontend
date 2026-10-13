"use client"

import { IconBox, IconPackage, IconStack2, type Icon } from "@tabler/icons-react"

import { totalShipmentCount, type DashboardData } from "@/app/dashboard/dashboard-types"
import { DeltaBadge, percentChange } from "@/components/dashboard/overview-card"

type Stat = {
  label: string
  hint: string
  value: number
  previous?: number
  icon: Icon
}

export function OverviewStats({
  data,
  previous,
}: {
  data: DashboardData
  previous?: DashboardData
}) {
  const stats: Stat[] = [
    {
      label: "Total Shipments",
      hint: "Active operationals in the selected period",
      value: totalShipmentCount(data.shipmentTypeCounts),
      previous: previous ? totalShipmentCount(previous.shipmentTypeCounts) : undefined,
      icon: IconPackage,
    },
    {
      label: "Containers",
      hint: "Active container lines on those operationals",
      value: data.containerStats.total,
      previous: previous?.containerStats.total,
      icon: IconBox,
    },
    {
      label: "TEU",
      hint: "20′ = 1 TEU, 40′ = 2 TEU",
      value: data.containerStats.teu,
      previous: previous?.containerStats.teu,
      icon: IconStack2,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map(({ label, hint, value, previous: prev, icon: Icon }) => (
        <div key={label} className="flex min-w-0 items-center gap-3" title={hint}>
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-card">
            <Icon className="size-6 text-foreground" stroke={1.6} aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="text-[30px] font-medium leading-none tracking-[-0.03em] tabular-nums text-foreground">
                {value.toLocaleString("id-ID")}
              </span>
              <DeltaBadge value={percentChange(value, prev)} />
            </div>
            <p className="mt-2 truncate text-[15px] text-foreground/80">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

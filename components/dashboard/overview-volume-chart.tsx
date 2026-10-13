"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { totalShipmentCount, type DashboardData } from "@/app/dashboard/dashboard-types"
import { OverviewCard } from "@/components/dashboard/overview-card"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCalendarDate } from "@/lib/date-input"

type View = "volume" | "type"

const VIEWS: Record<View, { label: string; config: ChartConfig }> = {
  volume: {
    label: "Volume",
    config: {
      shipments: { label: "Shipments", color: "var(--chart-1)" },
      containers: { label: "Containers", color: "var(--chart-2)" },
    },
  },
  type: {
    label: "By type",
    config: {
      EXPORT: { label: "Export", color: "var(--chart-1)" },
      IMPORT: { label: "Import", color: "var(--chart-2)" },
      DOMESTIC: { label: "Domestic", color: "var(--chart-3)" },
    },
  },
}

function weekLabel(weekStart: string) {
  const formatted = formatCalendarDate(weekStart)
  const year = weekStart.split("-")[0]
  if (!year || formatted === "-") return weekStart
  return formatted.replace(` ${year}`, "")
}

export function OverviewVolumeChart({ data }: { data: DashboardData }) {
  const [view, setView] = useState<View>("volume")
  const config = VIEWS[view].config
  const keys = Object.keys(config)
  const total = totalShipmentCount(data.shipmentTypeCounts)
  const hasData = data.weeklyVolume.some(
    (week) => week.EXPORT + week.IMPORT + week.DOMESTIC + week.containers > 0
  )

  const chartData = data.weeklyVolume.map((week) => ({
    ...week,
    shipments: week.EXPORT + week.IMPORT + week.DOMESTIC,
    label: weekLabel(week.weekStart),
  }))

  const totals: Record<string, number> = {
    shipments: total,
    containers: data.containerStats.total,
    EXPORT: data.shipmentTypeCounts.EXPORT ?? 0,
    IMPORT: data.shipmentTypeCounts.IMPORT ?? 0,
    DOMESTIC: data.shipmentTypeCounts.DOMESTIC ?? 0,
  }

  return (
    <OverviewCard
      className="h-full"
      title="Shipments Statistics"
      description={`Total operationals this period: ${total.toLocaleString("id-ID")}`}
      action={
        <div className="flex items-center gap-4">
          <ul className="hidden items-center gap-4 md:flex" aria-label="Legend">
            {keys.map((key) => (
              <li key={key} className="flex items-center gap-2 text-sm text-foreground">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: config[key].color as string }}
                />
                {config[key].label}
              </li>
            ))}
          </ul>
          <Select value={view} onValueChange={(next) => setView(next as View)}>
            <SelectTrigger size="sm" className="border-transparent bg-muted pl-4 hover:border-transparent hover:bg-accent" aria-label="Chart view">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {(Object.keys(VIEWS) as View[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {VIEWS[key].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      {hasData ? (
        <>
          <ChartContainer config={config} className="aspect-auto h-[300px] w-full lg:h-[340px]">
            <BarChart data={chartData} barGap={2} barCategoryGap="22%" margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 6" stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fill: "var(--muted-foreground)", fontSize: 13 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={32}
                tick={{ fill: "var(--muted-foreground)", fontSize: 13 }}
              />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", radius: 8 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const week = payload[0]?.payload as (typeof chartData)[number] | undefined
                  if (!week) return null
                  return (
                    <div className="grid min-w-[11rem] gap-1.5 rounded-xl border border-border bg-popover px-3 py-2.5 text-xs shadow-[0_12px_32px_rgba(var(--mli-ink-rgb),0.12)]">
                      <p className="font-medium text-foreground">
                        Week of {formatCalendarDate(week.weekStart)}
                      </p>
                      {keys.map((key) => (
                        <div key={key} className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: config[key].color as string }}
                            />
                            {config[key].label}
                          </span>
                          <span className="font-medium tabular-nums text-foreground">
                            {Number(week[key as keyof typeof week] ?? 0).toLocaleString("id-ID")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                }}
              />
              {keys.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={config[key].color as string}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={18}
                />
              ))}
            </BarChart>
          </ChartContainer>
          <dl className="mt-4 flex flex-wrap gap-2">
            {keys.map((key) => (
              <div
                key={key}
                className="flex items-center gap-2 rounded-full bg-muted px-3.5 py-1.5 text-sm"
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: config[key].color as string }}
                />
                <dt className="text-muted-foreground">{config[key].label}</dt>
                <dd className="font-medium tabular-nums text-foreground">
                  {totals[key].toLocaleString("id-ID")}
                </dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <p className="flex flex-1 items-center justify-center py-20 text-center text-sm text-muted-foreground">
          No operational shipments in this date range.
        </p>
      )}
    </OverviewCard>
  )
}

"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  SHIPMENT_TYPES,
  totalShipmentCount,
  type DashboardData,
} from "@/app/dashboard/dashboard-types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import { glassPanel, glassShine } from "@/lib/design"
import { cn, formatDate } from "@/lib/utils"

const chartConfig = {
  EXPORT: { label: "Export", color: "var(--chart-1)" },
  IMPORT: { label: "Import", color: "var(--chart-2)" },
  DOMESTIC: { label: "Domestic", color: "var(--chart-3)" },
  containers: { label: "Containers" },
} satisfies ChartConfig

function weekLabel(weekStart: string) {
  const [year, month, day] = weekStart.split("-")
  if (!year || !month || !day) return weekStart
  return formatDate(weekStart).replace(` ${year}`, "")
}

export function DashboardShipmentVolumeChart({ data }: { data: DashboardData }) {
  const total = totalShipmentCount(data.shipmentTypeCounts)
  const hasData = data.weeklyVolume.some(
    (week) => week.EXPORT + week.IMPORT + week.DOMESTIC > 0
  )

  if (!hasData) {
    return (
      <Card className={cn(glassPanel, "h-full min-w-0 gap-0 overflow-hidden p-6 shadow-none lg:p-7")}>
        <CardHeader>
          <CardTitle>Weekly volume</CardTitle>
          <CardDescription>
            Export, import, and domestic operational counts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-12 text-center text-sm text-muted-foreground">
            No operational shipments in this date range.
          </p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.weeklyVolume.map((week) => ({
    ...week,
    label: weekLabel(week.weekStart),
  }))

  return (
    <Card className={cn(glassPanel, "relative h-full min-w-0 gap-0 overflow-hidden p-6 shadow-none lg:p-7")}>
      <div aria-hidden className={glassShine} />
      <CardHeader className="pb-2">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          Volume
        </p>
        <CardTitle>Weekly volume</CardTitle>
        <CardDescription>
          {total.toLocaleString("id-ID")} operationals — stacked by type
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ChartContainer config={chartConfig} className="aspect-[16/9] max-h-[280px] w-full">
          <BarChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(27,54,93,0.08)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
            <ChartTooltip
              cursor={{ fill: "rgba(27,54,93,0.04)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const week = payload[0]?.payload as
                  | DashboardData["weeklyVolume"][number]
                  | undefined
                if (!week) return null
                const rows = [
                  ...SHIPMENT_TYPES.map((type) => ({
                    key: type,
                    label: chartConfig[type].label,
                    color: chartConfig[type].color,
                    value: week[type],
                  })),
                  {
                    key: "containers",
                    label: "Containers",
                    color: "var(--chart-5)",
                    value: week.containers,
                  },
                ]

                return (
                  <div className="border-border/50 bg-background grid min-w-[10rem] gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
                    <p className="font-medium">Week of {formatDate(week.weekStart)}</p>
                    {rows.map((row) => (
                      <div key={row.key} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span
                            className="size-2 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: row.color }}
                          />
                          {row.label}
                        </span>
                        <span className="font-medium tabular-nums">
                          {row.value.toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              }}
            />
            {SHIPMENT_TYPES.map((type) => (
              <Bar
                key={type}
                dataKey={type}
                stackId="shipments"
                fill={chartConfig[type].color}
                radius={type === "DOMESTIC" ? [6, 6, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {SHIPMENT_TYPES.map((type) => (
            <div
              key={type}
              className="flex items-center gap-2 rounded-md border border-[rgba(214,227,255,0.4)] bg-[rgba(247,249,251,0.5)] px-3 py-2 text-sm"
            >
              <span
                className="size-2.5 rounded-md"
                style={{ backgroundColor: chartConfig[type].color }}
              />
              <span className="text-muted-foreground">{chartConfig[type].label}</span>
              <span className="ml-auto font-semibold tabular-nums">
                {(data.shipmentTypeCounts[type] ?? 0).toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

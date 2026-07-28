"use client"

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"

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
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { glassPanel } from "@/lib/design"
import { cn } from "@/lib/utils"

const chartConfig = {
  count: { label: "Shipments" },
  EXPORT: { label: "Export", color: "var(--chart-1)" },
  IMPORT: { label: "Import", color: "var(--chart-2)" },
  DOMESTIC: { label: "Domestic", color: "var(--chart-3)" },
} satisfies ChartConfig

function toChartData(counts: DashboardData["shipmentTypeCounts"]) {
  return SHIPMENT_TYPES.map((type) => ({
    type,
    label: chartConfig[type].label as string,
    count: counts[type] ?? 0,
    fill: chartConfig[type].color,
  }))
}

function percentOf(value: number, total: number) {
  if (total === 0) return "0%"
  return `${Math.round((value / total) * 100)}%`
}

export function DashboardShipmentVolumeChart({ data }: { data: DashboardData }) {
  const chartData = toChartData(data.shipmentTypeCounts)
  const total = totalShipmentCount(data.shipmentTypeCounts)
  const hasData = chartData.some((item) => item.count > 0)

  if (!hasData) {
    return (
      <Card className={cn(glassPanel, "h-full min-w-0 gap-0 overflow-hidden p-6 shadow-none lg:p-7")}>
        <CardHeader>
          <CardTitle>Shipment volume</CardTitle>
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

  return (
    <Card className={cn(glassPanel, "relative h-full min-w-0 gap-0 overflow-hidden p-6 shadow-none lg:p-7")}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.65)] to-transparent"
      />
      <CardHeader className="pb-2">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          Volume
        </p>
        <CardTitle>Shipment volume</CardTitle>
        <CardDescription>
          {total.toLocaleString("id-ID")} operationals — breakdown by type
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="label"
              innerRadius={48}
              outerRadius={78}
              paddingAngle={3}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.type} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <ChartContainer config={chartConfig} className="aspect-[4/3] max-h-[180px] w-full">
          <BarChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(27,54,93,0.08)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.type} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {chartData.map((item) => (
            <div
              key={item.type}
              className="flex items-center gap-2 rounded-md border border-[rgba(214,227,255,0.4)] bg-[rgba(247,249,251,0.5)] px-3 py-2 text-sm"
            >
              <span
                className="size-2.5 rounded-md"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-muted-foreground">{item.label}</span>
              <span className="ml-auto font-semibold tabular-nums">{item.count}</span>
              <span className="text-xs text-muted-foreground">
                {percentOf(item.count, total)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

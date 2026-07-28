"use client"

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

import type { DashboardData } from "@/app/dashboard/dashboard-types"
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
  amount: { label: "Amount (IDR)" },
  selling: { label: "Net selling", color: "var(--chart-1)" },
  costing: { label: "Net costing", color: "var(--chart-2)" },
  revenue: { label: "Net revenue", color: "var(--chart-3)" },
} satisfies ChartConfig

function parseAmount(value: string | number) {
  return typeof value === "string" ? parseFloat(value) : value
}

function formatIdrCompact(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return value.toLocaleString("id-ID")
}

function toChartData(data: DashboardData) {
  return [
    {
      key: "selling",
      label: chartConfig.selling.label as string,
      amount: parseAmount(data.totalNetSelling),
      fill: chartConfig.selling.color,
    },
    {
      key: "costing",
      label: chartConfig.costing.label as string,
      amount: parseAmount(data.totalNetCosting),
      fill: chartConfig.costing.color,
    },
    {
      key: "revenue",
      label: chartConfig.revenue.label as string,
      amount: parseAmount(data.netRevenue),
      fill: chartConfig.revenue.color,
    },
  ]
}

export function DashboardShipmentChart({ data }: { data: DashboardData }) {
  const chartData = toChartData(data)
  const hasData = chartData.some((item) => item.amount !== 0 && !Number.isNaN(item.amount))

  if (!hasData) {
    return (
      <Card className={cn(glassPanel, "relative h-full min-w-0 gap-0 overflow-hidden p-6 shadow-none lg:p-7")}>
        <CardHeader>
          <CardTitle>Financial overview</CardTitle>
          <CardDescription>
            Net selling, costing, and revenue for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-12 text-center text-sm text-muted-foreground">
            No selling or costing activity in this date range.
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
          Analytics
        </p>
        <CardTitle>Financial overview</CardTitle>
        <CardDescription>
          Net selling, costing, and revenue (after VAT &amp; PPH23)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-[16/9] max-h-[320px] w-full">
          <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(27,54,93,0.08)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={formatIdrCompact}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    Number(value).toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })
                  }
                />
              }
            />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="mt-5 grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-3">
          {chartData.map((item) => (
            <div
              key={item.key}
              className="flex min-w-0 items-start gap-2.5 rounded-md border border-[rgba(214,227,255,0.4)] bg-[rgba(247,249,251,0.5)] px-3 py-2.5 text-sm"
              title={item.amount.toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              })}
            >
              <span
                className="mt-1 size-2.5 shrink-0 rounded-md"
                style={{ backgroundColor: item.fill }}
              />
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">{item.label}</span>
                <span className="block truncate font-semibold tabular-nums">
                  {item.amount.toLocaleString("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    notation: "compact",
                    maximumFractionDigits: 1,
                  })}
                </span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

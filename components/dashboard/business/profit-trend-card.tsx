"use client"

import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts"

import type { BusinessData } from "@/app/dashboard/dashboard-types"
import { formatIdr, formatIdrCompact, OverviewCard } from "@/components/dashboard/overview-card"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { formatCalendarDate } from "@/lib/date-input"

const config = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  cost: { label: "Cost", color: "var(--chart-3)" },
  profit: { label: "Profit", color: "var(--mli-positive)" },
} satisfies ChartConfig

const SERIES = Object.keys(config) as (keyof typeof config)[]

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function pointLabel(start: string, granularity: "week" | "month") {
  const [year, month, day] = start.split("-").map(Number)
  return granularity === "month" ? `${MONTHS[month - 1]} ${String(year).slice(2)}` : `${day} ${MONTHS[month - 1]}`
}

/** Revenue and cost as bars with profit as a line: all rupiah, so one axis. */
export function ProfitTrendCard({ profit }: { profit: NonNullable<BusinessData["profit"]> }) {
  const { granularity, points } = profit.trend
  const chartData = points.map((point) => ({
    start: point.start,
    label: pointLabel(point.start, granularity),
    jobs: point.jobs,
    revenue: Number(point.revenue),
    cost: Number(point.cost),
    profit: Number(point.profit),
  }))
  const hasData = chartData.some((point) => point.revenue || point.cost)
  const best = hasData ? chartData.reduce((top, point) => (point.profit > top.profit ? point : top)) : null

  return (
    <OverviewCard
      className="h-full"
      title="Profit over time"
      description={`Sales jobs by the ${granularity} they were opened. Before tax.`}
      action={
        <ul className="hidden items-center gap-4 md:flex" aria-label="Legend">
          {SERIES.map((key) => (
            <li key={key} className="flex items-center gap-2 text-sm text-foreground">
              <span
                className={key === "profit" ? "h-0.5 w-4 rounded-full" : "size-3 rounded-full"}
                style={{ backgroundColor: config[key].color }}
              />
              {config[key].label}
            </li>
          ))}
        </ul>
      }
    >
      {hasData ? (
        <>
          <ChartContainer config={config} className="aspect-auto h-[280px] w-full lg:h-[320px]">
            <ComposedChart data={chartData} barGap={2} barCategoryGap="24%" margin={{ left: 0, right: 4, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 6" stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fill: "var(--muted-foreground)", fontSize: 13 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={(value: number) => formatIdrCompact(value).replace(/\s/g, " ")}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", radius: 8 }}
                content={({ active, payload }) => {
                  const point = active ? (payload?.[0]?.payload as (typeof chartData)[number] | undefined) : undefined
                  if (!point) return null
                  const margin = point.revenue > 0 ? (point.profit / point.revenue) * 100 : null
                  return (
                    <div className="grid min-w-[13rem] gap-1.5 rounded-xl border border-border bg-popover px-3 py-2.5 text-xs shadow-[0_12px_32px_rgba(var(--mli-ink-rgb),0.12)]">
                      <p className="font-medium text-foreground">
                        {granularity === "week" ? `Week of ${formatCalendarDate(point.start)}` : point.label} · {point.jobs} job
                        {point.jobs === 1 ? "" : "s"}
                      </p>
                      {SERIES.map((key) => (
                        <div key={key} className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="size-2 rounded-full" style={{ backgroundColor: config[key].color }} />
                            {config[key].label}
                          </span>
                          <span className="font-medium tabular-nums text-foreground">{formatIdr(point[key])}</span>
                        </div>
                      ))}
                      {margin !== null ? (
                        <p className="border-t border-border pt-1.5 text-muted-foreground">
                          Margin <span className="font-medium text-foreground">{margin.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%</span>
                        </p>
                      ) : null}
                    </div>
                  )
                }}
              />
              <Bar dataKey="revenue" fill={config.revenue.color} radius={[4, 4, 0, 0]} maxBarSize={22} />
              <Bar dataKey="cost" fill={config.cost.color} radius={[4, 4, 0, 0]} maxBarSize={22} />
              <Line
                dataKey="profit"
                type="monotone"
                stroke={config.profit.color}
                strokeWidth={2}
                dot={{ r: 4, fill: config.profit.color, stroke: "var(--card)", strokeWidth: 2 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ChartContainer>
          {best && best.profit > 0 ? (
            <p className="mt-3 text-[13px] text-muted-foreground">
              Best {granularity}:{" "}
              <span className="font-medium text-foreground">
                {granularity === "week" ? `week of ${formatCalendarDate(best.start)}` : best.label}
              </span>{" "}
              with <span className="font-medium text-[var(--mli-positive)]">{formatIdrCompact(best.profit)}</span> profit.
            </p>
          ) : null}
        </>
      ) : (
        <p className="flex flex-1 items-center justify-center py-20 text-center text-sm text-muted-foreground">
          No sales jobs were opened in this timeframe.
        </p>
      )}
    </OverviewCard>
  )
}

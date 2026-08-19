"use client"

import type { DashboardContainerStats, DashboardData } from "@/app/dashboard/dashboard-types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { glassPanel, glassShine } from "@/lib/design"
import { cn } from "@/lib/utils"

const SIZE_COLORS: Record<string, string> = {
  "20": "var(--chart-1)",
  "40": "var(--chart-3)",
}

const TYPE_COLORS: Record<string, string> = {
  DRY: "var(--chart-2)",
  RF: "var(--chart-4)",
}

const FALLBACK_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]

function MixList({
  title,
  rows,
  colors,
}: {
  title: string
  rows: DashboardContainerStats["bySize"]
  colors: Record<string, string>
}) {
  const total = rows.reduce((sum, row) => sum + row.count, 0)

  if (rows.length === 0) {
    return (
      <div>
        <p className="mb-2 text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">No container lines in this range.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      <p className="text-sm font-medium">{title}</p>
      {rows.map((row, index) => {
        const share = total === 0 ? 0 : Math.round((row.count / total) * 100)
        const color = colors[row.name] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]

        return (
          <div key={`${title}-${row.name}`}>
            <div className="mb-1 flex items-center gap-2 text-sm">
              <span className="size-2.5 shrink-0 rounded-md" style={{ backgroundColor: color }} />
              <span className="truncate text-muted-foreground">{row.name}</span>
              <span className="ml-auto font-semibold tabular-nums">
                {row.count.toLocaleString("id-ID")}
              </span>
              <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                {share}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(214,227,255,0.45)]">
              <div
                className="h-full rounded-full"
                style={{ width: `${share}%`, backgroundColor: color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function DashboardContainerMix({ data }: { data: DashboardData }) {
  const { total, teu, bySize, byType } = data.containerStats
  const hasData = total > 0

  return (
    <Card className={cn(glassPanel, "relative h-full min-w-0 gap-0 overflow-hidden p-6 shadow-none lg:p-7")}>
      <div aria-hidden className={glassShine} />
      <CardHeader className="pb-2">
        <p className="mb-1 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          Mix
        </p>
        <CardTitle>Container mix</CardTitle>
        <CardDescription>
          {hasData
            ? `${total.toLocaleString("id-ID")} boxes · ${teu.toLocaleString("id-ID")} TEU`
            : "Size and type split for containers in this period"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="grid grid-cols-1 gap-6">
            <MixList title="By size" rows={bySize} colors={SIZE_COLORS} />
            <MixList title="By type" rows={byType} colors={TYPE_COLORS} />
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No containers on operationals in this date range.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

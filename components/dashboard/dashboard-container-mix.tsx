"use client"

import type { DashboardContainerStats, DashboardData } from "@/app/dashboard/dashboard-types"
import { OverviewCard } from "@/components/dashboard/overview-card"

/** Fixed order so a given size/type keeps its color across periods. */
const SERIES_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-5)"]

function MixBar({ title, rows }: { title: string; rows: DashboardContainerStats["bySize"] }) {
  const total = rows.reduce((sum, row) => sum + row.count, 0)
  const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">{title}</p>
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-muted">
        {sorted.map((row, index) => (
          <div
            key={row.name}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{
              width: `${total === 0 ? 0 : (row.count / total) * 100}%`,
              backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length],
            }}
            title={`${row.name}: ${row.count}`}
          />
        ))}
      </div>
      <ul className="mt-3 space-y-1.5">
        {sorted.map((row, index) => (
          <li key={row.name} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length] }}
            />
            <span className="truncate text-foreground/80">{row.name}</span>
            <span className="ml-auto font-medium tabular-nums text-foreground">
              {row.count.toLocaleString("id-ID")}
            </span>
            <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
              {total === 0 ? 0 : Math.round((row.count / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DashboardContainerMix({ data }: { data: DashboardData }) {
  const { total, teu, bySize, byType } = data.containerStats

  return (
    <OverviewCard
      title="Container Mix"
      description={
        total > 0
          ? `${total.toLocaleString("id-ID")} boxes · ${teu.toLocaleString("id-ID")} TEU`
          : "Size and type split this period"
      }
      className="h-full"
    >
      {total > 0 ? (
        <div className="space-y-6">
          <MixBar title="By size" rows={bySize} />
          <MixBar title="By type" rows={byType} />
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No containers on operationals in this date range.
        </p>
      )}
    </OverviewCard>
  )
}

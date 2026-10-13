"use client"

import Link from "next/link"

import type { BusinessData, BusinessJobHealth } from "@/app/dashboard/dashboard-types"
import { formatIdr, formatIdrCompact, OverviewCard } from "@/components/dashboard/overview-card"
import { usePermissions } from "@/hooks/use-permissions"
import { cn } from "@/lib/utils"

type Profit = NonNullable<BusinessData["profit"]>

function initials(name: string) {
  return name
    .replace(/^(PT|CV|UD)\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

function marginText(margin: number | null) {
  return margin === null ? "—" : `${margin.toLocaleString("id-ID")}%`
}

/** Who actually makes us money: customers ranked by profit, not by how busy they keep us. */
export function CustomerProfitCard({ customers }: { customers: Profit["customers"] }) {
  const { canView } = usePermissions()
  const top = Math.max(1, ...customers.map((row) => Math.abs(Number(row.profit))))

  return (
    <OverviewCard className="h-full" title="Most profitable customers" description="Profit from their sales jobs this period.">
      {customers.length === 0 ? (
        <p className="flex flex-1 items-center justify-center py-10 text-center text-sm text-muted-foreground">
          No customer jobs in this timeframe.
        </p>
      ) : (
        <ol className="space-y-3.5">
          {customers.map((row, index) => {
            const profit = Number(row.profit)
            const name = (
              <span className="truncate text-sm font-medium text-foreground" title={row.customerName}>
                {row.customerName}
              </span>
            )
            return (
              <li key={row.customerId} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    index === 0 ? "brand-fill text-white" : "bg-muted text-foreground"
                  )}
                >
                  {initials(row.customerName)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    {canView("CUSTOMER") ? (
                      <Link href={`/dashboard/customers/${row.customerId}`} className="min-w-0 truncate hover:underline">
                        {name}
                      </Link>
                    ) : (
                      name
                    )}
                    <span
                      className={cn("shrink-0 text-sm font-semibold tabular-nums", profit < 0 && "text-[var(--mli-negative)]")}
                      title={formatIdr(profit)}
                    >
                      {formatIdrCompact(profit)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", profit < 0 ? "bg-[var(--mli-negative)]" : "bg-primary")}
                        style={{ width: `${(Math.abs(profit) / top) * 100}%` }}
                      />
                    </div>
                    <span className="w-24 shrink-0 text-right text-[11px] text-muted-foreground tabular-nums">
                      {row.jobs} job{row.jobs === 1 ? "" : "s"} · {marginText(row.margin)}
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </OverviewCard>
  )
}

const HEALTH: { key: BusinessJobHealth; label: string; color: string; text: string }[] = [
  { key: "healthy", label: "Healthy", color: "var(--mli-positive)", text: "text-[var(--mli-on-success-container)]" },
  { key: "thin", label: "Thin margin", color: "#e0a030", text: "text-[var(--mli-on-warning-container)]" },
  { key: "loss", label: "Losing money", color: "var(--mli-negative)", text: "text-[var(--mli-negative)]" },
  { key: "nothing", label: "Nothing charged", color: "var(--chart-3)", text: "text-muted-foreground" },
]

/** How the period's jobs are doing, and the ones to look at first. */
export function JobHealthCard({ health }: { health: Profit["health"] }) {
  const { canView } = usePermissions()
  const total = HEALTH.reduce((sum, item) => sum + health.counts[item.key], 0)

  return (
    <OverviewCard className="h-full" title="Job health" description="Sales jobs opened this period, by margin.">
      {total === 0 ? (
        <p className="flex flex-1 items-center justify-center py-10 text-center text-sm text-muted-foreground">No jobs yet.</p>
      ) : (
        <>
          <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Jobs by margin">
            {HEALTH.map((item) =>
              health.counts[item.key] ? (
                <div
                  key={item.key}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${(health.counts[item.key] / total) * 100}%`, backgroundColor: item.color }}
                  title={`${item.label}: ${health.counts[item.key]}`}
                />
              ) : null
            )}
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px]">
            {HEALTH.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-2">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </dt>
                <dd className="font-medium tabular-nums text-foreground">{health.counts[item.key]}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Look at these first</p>
            {health.needsReview.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">No job is losing money or running thin.</p>
            ) : (
              <ul className="-mx-2 space-y-0.5">
                {health.needsReview.map((job) => {
                  const tone = HEALTH.find((item) => item.key === job.health)
                  const body = (
                    <>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono text-[13px] font-medium text-foreground">{job.salesNumber}</span>
                        <span className="block truncate text-xs text-muted-foreground">{job.customerName ?? "No customer"}</span>
                      </span>
                      <span className={cn("shrink-0 text-right text-[13px] font-medium tabular-nums", tone?.text)}>
                        {formatIdrCompact(job.profit)}
                        <span className="block text-[11px] font-normal">{marginText(job.margin)}</span>
                      </span>
                    </>
                  )
                  return (
                    <li key={job.id}>
                      {canView("SALES") ? (
                        <Link href={`/dashboard/sales/${job.id}`} className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/70">
                          {body}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 px-2 py-1.5">{body}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </OverviewCard>
  )
}

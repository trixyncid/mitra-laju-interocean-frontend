"use client"

import { useState } from "react"
import Link from "next/link"
import {
  IconArrowUpRight,
  IconChevronLeft,
  IconChevronRight,
  IconShip,
} from "@tabler/icons-react"

import type { DashboardVoyageGroup } from "@/app/dashboard/dashboard-types"
import { OverviewCard } from "@/components/dashboard/overview-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardShipmentsByVoyage } from "@/hooks/use-dashboard-shipments-by-voyage"
import { usePermissions } from "@/hooks/use-permissions"
import { formatCalendarDate } from "@/lib/date-input"
import { cn, getInitialContactName } from "@/lib/utils"

function mostCommon(values: (string | null)[]) {
  const counts = new Map<string, number>()
  for (const value of values) {
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

function RoutePanel({ from, to }: { from: string | null; to: string | null }) {
  return (
    <div
      className="relative h-40 overflow-hidden rounded-xl bg-muted"
      style={{
        backgroundImage: "radial-gradient(var(--input) 1px, transparent 1px)",
        backgroundSize: "14px 14px",
      }}
    >
      <svg viewBox="0 0 300 160" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
        <path
          d="M40 120 C 110 20, 190 20, 260 60"
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth="2"
          strokeDasharray="6 6"
          strokeLinecap="round"
        />
        <circle cx="40" cy="120" r="7" fill="var(--card)" stroke="var(--chart-1)" strokeWidth="3" />
        <circle cx="260" cy="60" r="7" fill="var(--chart-1)" />
      </svg>
      <span className="absolute left-1/2 top-[34%] flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full brand-fill shadow-[0_6px_16px_rgba(var(--mli-ink-rgb),0.25)]">
        <IconShip className="size-[18px]" />
      </span>
      <span className="absolute bottom-3 left-3 max-w-[45%] truncate rounded-full bg-card px-2.5 py-1 text-xs font-medium text-foreground">
        {from ?? "Departure —"}
      </span>
      <span className="absolute right-3 top-3 max-w-[45%] truncate rounded-full bg-card px-2.5 py-1 text-xs font-medium text-foreground">
        {to ?? "Destination —"}
      </span>
    </div>
  )
}

function Timeline({ voyage }: { voyage: DashboardVoyageGroup }) {
  const from = mostCommon(voyage.shipments.map((s) => s.portDeparture))
  const to = mostCommon(voyage.shipments.map((s) => s.portDestination))
  const containers = voyage.shipments.reduce((sum, s) => sum + (s.containers?.length ?? 0), 0)

  const steps = [
    {
      title: "Departure",
      detail: from ?? "Port not set",
      meta: voyage.etd ? `ETD ${formatCalendarDate(voyage.etd)}` : "ETD —",
      done: true,
    },
    {
      title: "In transit",
      detail: `${voyage.shipments.length} shipment${voyage.shipments.length === 1 ? "" : "s"} · ${containers} container${containers === 1 ? "" : "s"}`,
      meta: "Now",
      done: true,
    },
    { title: "Arrival", detail: to ?? "Port not set", meta: "--:--", done: false },
  ]

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => (
        <li key={step.title} className="relative flex gap-3 pb-4 last:pb-0">
          {index < steps.length - 1 ? (
            <span
              aria-hidden
              className={cn(
                "absolute left-[5px] top-4 h-[calc(100%-8px)] border-l-2 border-dashed",
                step.done ? "border-primary/50" : "border-border"
              )}
            />
          ) : null}
          <span
            aria-hidden
            className={cn(
              "relative mt-1 size-3 shrink-0 rounded-full",
              step.done ? "bg-primary ring-4 ring-primary/15" : "border-2 border-input bg-card"
            )}
          />
          <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{step.title}</p>
              <p className="truncate text-sm font-medium text-foreground">{step.detail}</p>
            </div>
            <span className="shrink-0 text-xs font-medium tabular-nums text-foreground/80">
              {step.meta}
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}

export function OverviewVoyageTracker() {
  const { data, isLoading, error } = useDashboardShipmentsByVoyage("ongoing")
  const { canRead } = usePermissions()
  const [index, setIndex] = useState(0)
  const voyages = data ?? []
  const voyage = voyages[Math.min(index, Math.max(voyages.length - 1, 0))]
  const lead = voyage?.shipments[0]

  const pager =
    voyages.length > 1 ? (
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-muted transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          aria-label="Previous voyage"
        >
          <IconChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-muted transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => setIndex((i) => Math.min(voyages.length - 1, i + 1))}
          disabled={index >= voyages.length - 1}
          aria-label="Next voyage"
        >
          <IconChevronRight className="size-4" />
        </button>
      </div>
    ) : null

  return (
    <OverviewCard
      title="Tracking Voyage"
      description={
        voyages.length > 0
          ? `Ongoing voyage ${index + 1} of ${voyages.length}`
          : "Ongoing vessel voyages"
      }
      action={pager}
      className="h-full"
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-6 w-2/3 rounded-full" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      ) : error ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Unable to load voyages.
        </p>
      ) : !voyage ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted">
            <IconShip className="size-5" />
          </span>
          <p className="text-sm text-muted-foreground">No ongoing voyages right now.</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-5">
          <RoutePanel
            from={mostCommon(voyage.shipments.map((s) => s.portDeparture))}
            to={mostCommon(voyage.shipments.map((s) => s.portDestination))}
          />

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Vessel / Voyage</p>
              <p className="line-clamp-2 text-[17px] font-medium tracking-[-0.01em] text-foreground">
                {voyage.vesselName} / {voyage.voyageNumber}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
              In transit
            </span>
          </div>

          <Timeline voyage={voyage} />

          {lead ? (
            <div className="mt-auto flex items-center gap-3 rounded-full bg-muted p-1.5 pr-1.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-xs font-medium text-foreground">
                {getInitialContactName(lead.customerName).slice(0, 2)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="truncate text-sm font-medium text-foreground">
                  {lead.customerName}
                  {voyage.shipments.length > 1 ? (
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      +{voyage.shipments.length - 1} more
                    </span>
                  ) : null}
                </p>
              </div>
              {canRead("shipments") ? (
                <Link
                  href={`/dashboard/shipments/${lead.id}`}
                  aria-label="Open shipment"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <IconArrowUpRight className="size-5" />
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </OverviewCard>
  )
}

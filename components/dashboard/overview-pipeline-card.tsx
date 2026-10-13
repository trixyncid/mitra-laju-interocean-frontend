"use client"

import type { DashboardData } from "@/app/dashboard/dashboard-types"
import { OverviewCard, OverviewCardLink } from "@/components/dashboard/overview-card"
import { cn } from "@/lib/utils"

const STEPS = [
  { key: "DRAFT" as const, label: "Draft", dot: "bg-[var(--chart-5)]" },
  { key: "BACKUP" as const, label: "Backup", dot: "bg-[var(--chart-3)]" },
  { key: "ONGOING" as const, label: "Ongoing", dot: "bg-[var(--mli-positive)]" },
]

/** Side-on container ship, drawn in the chart palette. */
function ShipIllustration({ className }: { className?: string }) {
  const stacks = [
    ["--chart-2", "--chart-4", "--chart-1"],
    ["--chart-4", "--chart-2", "--chart-2"],
    ["--chart-1", "--chart-4"],
    ["--chart-2", "--chart-1", "--chart-4"],
    ["--chart-4", "--chart-2"],
  ]
  return (
    <svg viewBox="0 0 240 130" className={className} aria-hidden>
      {stacks.map((stack, col) =>
        stack.map((color, row) => (
          <rect
            key={`${col}-${row}`}
            x={42 + col * 30}
            y={70 - (row + 1) * 16}
            width="28"
            height="14"
            rx="2"
            fill={`var(${color})`}
          />
        ))
      )}
      <rect x="196" y="30" width="22" height="40" rx="3" fill="var(--chart-1)" />
      <rect x="200" y="36" width="14" height="6" rx="1.5" fill="var(--card)" />
      <rect x="204" y="18" width="6" height="12" rx="1" fill="var(--chart-1)" />
      <path d="M12 72 H232 L214 106 H34 Z" fill="var(--chart-1)" />
      <path d="M30 96 H218" stroke="var(--card)" strokeOpacity="0.25" strokeWidth="2" />
      <path
        d="M0 116 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0"
        fill="none"
        stroke="var(--chart-3)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function OverviewPipelineCard({ data }: { data: DashboardData }) {
  const open = STEPS.reduce((sum, step) => sum + (data.shipmentStatusCounts[step.key] ?? 0), 0)

  return (
    <OverviewCard
      title="Open Pipeline"
      description="Jobs in progress right now"
      action={<OverviewCardLink href="/dashboard/shipments" label="Open shipments" />}
      className="h-full"
    >
      <div className="relative z-10 flex flex-col gap-1">
        <span className="text-[34px] font-medium leading-none tracking-[-0.03em] tabular-nums text-foreground">
          {open.toLocaleString("id-ID")}
        </span>
        <span className="text-sm text-muted-foreground">
          {data.finishedInPeriod.toLocaleString("id-ID")} finished this period
        </span>
      </div>

      <ul className="relative z-10 mt-5 space-y-2.5">
        {STEPS.map((step) => (
          <li key={step.key} className="flex items-center gap-2 text-sm">
            <span className={cn("size-2.5 rounded-full", step.dot)} />
            <span className="text-foreground/80">{step.label}</span>
            <span className="font-medium tabular-nums text-foreground">
              {(data.shipmentStatusCounts[step.key] ?? 0).toLocaleString("id-ID")}
            </span>
          </li>
        ))}
      </ul>

      <ShipIllustration className="pointer-events-none absolute -right-6 bottom-3 w-[62%] max-w-[260px]" />
    </OverviewCard>
  )
}

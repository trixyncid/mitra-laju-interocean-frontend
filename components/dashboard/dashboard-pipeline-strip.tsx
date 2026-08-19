"use client"

import type { DashboardData } from "@/app/dashboard/dashboard-types"
import { Card } from "@/components/ui/card"
import { glassPanel, glassShine } from "@/lib/design"
import { cn } from "@/lib/utils"

const PIPELINE_STEPS = [
  {
    key: "DRAFT" as const,
    label: "Draft",
    description: "Open jobs, not yet confirmed",
    accent: "bg-[var(--mli-draft-container)]",
  },
  {
    key: "BACKUP" as const,
    label: "Backup",
    description: "Held as backup cargo",
    accent: "bg-[var(--mli-backup-container)]",
  },
  {
    key: "ONGOING" as const,
    label: "Ongoing",
    description: "Active operational work",
    accent: "bg-[var(--mli-success-container)]",
  },
]

export function DashboardPipelineStrip({ data }: { data: DashboardData }) {
  const totalOpen = PIPELINE_STEPS.reduce(
    (sum, step) => sum + (data.shipmentStatusCounts[step.key] ?? 0),
    0
  )

  return (
    <Card className={cn(glassPanel, "relative gap-0 overflow-hidden p-5 shadow-none lg:p-6")}>
      <div aria-hidden className={glassShine} />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Pipeline
          </p>
          <p className="text-sm text-muted-foreground">
            Open work right now — not limited to the date range
          </p>
        </div>
        <p className="text-sm tabular-nums text-muted-foreground">
          <span className="font-semibold text-foreground">
            {totalOpen.toLocaleString("id-ID")}
          </span>{" "}
          open
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PIPELINE_STEPS.map((step) => {
          const count = data.shipmentStatusCounts[step.key] ?? 0
          const share = totalOpen === 0 ? 0 : Math.round((count / totalOpen) * 100)

          return (
            <div
              key={step.key}
              className="rounded-md border border-[rgba(214,227,255,0.4)] bg-[rgba(247,249,251,0.5)] px-3 py-3"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className={cn("size-2 shrink-0 rounded-md", step.accent)} />
                <span className="text-sm font-medium">{step.label}</span>
                <span className="ml-auto text-lg font-semibold tabular-nums">
                  {count.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-[rgba(214,227,255,0.45)]">
                <div
                  className={cn("h-full rounded-full", step.accent)}
                  style={{ width: `${share}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

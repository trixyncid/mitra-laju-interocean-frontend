"use client"

import {
  IconBox,
  IconCircleCheck,
  IconCoin,
  IconPackage,
  IconReceipt,
  IconStack2,
  IconTrendingUp,
} from "@tabler/icons-react"

import {
  totalShipmentCount,
  type DashboardData,
} from "@/app/dashboard/dashboard-types"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { glassPanelInteractive } from "@/lib/design"
import { FINANCIAL_MODULES_ENABLED } from "@/lib/feature-flags"
import { cn } from "@/lib/utils"

function parseAmount(value: string | number) {
  return typeof value === "string" ? parseFloat(value) : value
}

function formatIdr(value: string | number) {
  const amount = parseAmount(value)
  if (Number.isNaN(amount)) return "—"
  return amount.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

/** Shorter label for narrow KPI cards; full value available via `title`. */
function formatIdrKpi(value: string | number) {
  const amount = parseAmount(value)
  if (Number.isNaN(amount)) return { display: "—", full: "—" }
  const full = formatIdr(amount)
  if (Math.abs(amount) >= 10_000) {
    const display = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount)
    return { display, full }
  }
  return { display: full, full }
}

function formatCount(value: number) {
  const display = value.toLocaleString("id-ID")
  return { display, full: display }
}

export function DashboardKpiCards({ data }: { data: DashboardData }) {
  const netRevenue = parseAmount(data.netRevenue)
  const shipmentTotal = totalShipmentCount(data.shipmentTypeCounts)
  const containerTotal = data.containerStats.total
  const teuTotal = data.containerStats.teu
  const finishedTotal = data.finishedInPeriod

  const opsCards = [
    {
      label: "Total shipments",
      description: "Active operationals in selected period",
      ...formatCount(shipmentTotal),
      icon: IconPackage,
      accent: "text-[var(--chart-1)]",
      tint: "from-[var(--chart-1)]/10 to-transparent",
    },
    {
      label: "Containers",
      description: "Active container lines on those operationals",
      ...formatCount(containerTotal),
      icon: IconBox,
      accent: "text-[var(--chart-2)]",
      tint: "from-[var(--chart-2)]/10 to-transparent",
    },
    {
      label: "TEU",
      description: "20′ = 1 TEU, 40′ = 2 TEU",
      ...formatCount(teuTotal),
      icon: IconStack2,
      accent: "text-[var(--chart-3)]",
      tint: "from-[var(--chart-3)]/10 to-transparent",
    },
    {
      label: "Finished",
      description: "Jobs marked finished in the selected period",
      ...formatCount(finishedTotal),
      icon: IconCircleCheck,
      accent: "text-secondary-foreground",
      tint: "from-[var(--mli-primary-container)]/12 to-transparent",
    },
  ]

  const financeCards = [
    {
      label: "Total selling",
      description: "Sum of net selling amounts in period",
      ...formatIdrKpi(data.totalNetSelling),
      icon: IconCoin,
      accent: "text-[var(--chart-1)]",
      tint: "from-[var(--chart-1)]/10 to-transparent",
    },
    {
      label: "Total costing",
      description: "Sum of net vendor costing amounts in period",
      ...formatIdrKpi(data.totalNetCosting),
      icon: IconReceipt,
      accent: "text-[var(--chart-2)]",
      tint: "from-[var(--chart-2)]/10 to-transparent",
    },
    {
      label: "Net revenue",
      description: "Total selling minus total costing",
      ...formatIdrKpi(data.netRevenue),
      icon: IconTrendingUp,
      accent:
        netRevenue >= 0
          ? "text-secondary-foreground"
          : "text-[var(--mli-on-error-container)]",
      tint:
        netRevenue >= 0
          ? "from-[var(--mli-primary-container)]/12 to-transparent"
          : "from-[var(--mli-error-container)] to-transparent",
    },
  ]

  const cards = FINANCIAL_MODULES_ENABLED
    ? [opsCards[0], ...financeCards]
    : opsCards

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, description, display, full, icon: Icon, accent, tint }) => (
        <Card
          key={label}
          className={cn(
            glassPanelInteractive,
            "relative min-w-0 gap-0 overflow-hidden p-5 shadow-none lg:p-6"
          )}
        >
          <div
            aria-hidden
            className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", tint)}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.65)] to-transparent"
          />
          <Icon
            className={cn(
              "pointer-events-none absolute right-5 top-5 size-7 shrink-0 opacity-30",
              accent
            )}
            aria-hidden
          />
          <CardHeader className="relative min-w-0 gap-1.5 pr-10">
            <CardDescription className="truncate text-[11px] font-semibold tracking-[0.08em] uppercase">
              {label}
            </CardDescription>
            <CardTitle
              className="text-xl font-semibold leading-tight tracking-tight text-balance break-words tabular-nums sm:text-2xl"
              title={full}
            >
              {display}
            </CardTitle>
            <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

"use client"

import {
  IconCoin,
  IconPackage,
  IconReceipt,
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

export function DashboardKpiCards({ data }: { data: DashboardData }) {
  const netRevenue = parseAmount(data.netRevenue)
  const shipmentTotal = totalShipmentCount(data.shipmentTypeCounts)

  const cards = [
    {
      label: "Total shipments",
      description: "Active operationals in selected period",
      display: shipmentTotal.toLocaleString("id-ID"),
      full: shipmentTotal.toLocaleString("id-ID"),
      icon: IconPackage,
      accent: "text-primary",
      highlight: false,
    },
    {
      label: "Total selling",
      description: "Sum of net selling amounts in period",
      ...formatIdrKpi(data.totalNetSelling),
      icon: IconCoin,
      accent: "text-[var(--chart-1)]",
      highlight: false,
    },
    {
      label: "Total costing",
      description: "Sum of net vendor costing amounts in period",
      ...formatIdrKpi(data.totalNetCosting),
      icon: IconReceipt,
      accent: "text-[var(--chart-2)]",
      highlight: false,
    },
    {
      label: "Net revenue",
      description: "Total selling minus total costing",
      ...formatIdrKpi(data.netRevenue),
      icon: IconTrendingUp,
      accent: netRevenue >= 0 ? "text-secondary-foreground" : "text-[var(--mli-on-error-container)]",
      highlight: true,
    },
  ] as const

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, description, display, full, icon: Icon, accent, highlight }, index) => (
        <Card
          key={label}
          className={cn(
            "relative min-w-0 overflow-hidden p-6 lg:p-8",
            highlight && "border-primary/10 bg-gradient-to-br from-primary/5 to-card",
            index === 0 && !highlight && "border-primary/10"
          )}
        >
          <Icon
            className={cn("pointer-events-none absolute right-6 top-6 size-8 shrink-0 opacity-40", accent)}
            aria-hidden
          />
          <CardHeader className="min-w-0 gap-1.5 pr-10">
            <CardDescription className="truncate">{label}</CardDescription>
            <CardTitle
              className="text-xl font-semibold leading-tight tracking-tight text-balance break-words tabular-nums sm:text-2xl 2xl:text-[1.65rem]"
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

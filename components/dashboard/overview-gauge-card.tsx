"use client"

import type { DashboardData } from "@/app/dashboard/dashboard-types"
import {
  DeltaBadge,
  formatIdr,
  formatIdrCompact,
  OverviewCard,
  OverviewCardLink,
  percentChange,
} from "@/components/dashboard/overview-card"
import { VENDOR_INVOICE_MODULE_ENABLED } from "@/lib/feature-flags"

const R = 80
const ARC = Math.PI * R

/** Half-ring gauge: how far this period has come relative to the previous one. */
function Gauge({ fraction }: { fraction: number }) {
  const clamped = Math.max(0, Math.min(1, fraction))
  return (
    <svg viewBox="0 0 200 110" className="w-full max-w-[300px]" aria-hidden>
      <path
        d={`M 20 100 A ${R} ${R} 0 0 1 180 100`}
        fill="none"
        stroke="var(--chart-4)"
        strokeWidth="26"
      />
      <path
        d={`M 20 100 A ${R} ${R} 0 0 1 180 100`}
        fill="none"
        stroke="var(--chart-2)"
        strokeWidth="26"
        strokeDasharray={`${ARC * clamped} ${ARC}`}
        className="transition-[stroke-dasharray] duration-700 ease-out"
      />
    </svg>
  )
}

export function OverviewGaugeCard({
  data,
  previous,
}: {
  data: DashboardData
  previous?: DashboardData
}) {
  const payables = VENDOR_INVOICE_MODULE_ENABLED
  const current = payables ? parseFloat(data.totalNetVendorInvoice) || 0 : data.finishedInPeriod
  const prior = previous
    ? payables
      ? parseFloat(previous.totalNetVendorInvoice) || 0
      : previous.finishedInPeriod
    : undefined
  const fraction = prior ? current / prior : current > 0 ? 1 : 0
  const display = payables ? formatIdrCompact(current) : current.toLocaleString("id-ID")

  return (
    <OverviewCard
      title="Analytic View"
      description={
        payables
          ? "Vendor payables after VAT & PPH23"
          : "Jobs marked finished in the period"
      }
      action={
        <OverviewCardLink
          href={payables ? "/dashboard/vendor-invoices" : "/dashboard/shipments"}
          label={payables ? "Open vendor invoices" : "Open shipments"}
        />
      }
    >
      <div className="relative mx-auto flex w-full max-w-[300px] flex-col items-center">
        <Gauge fraction={fraction} />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span
            className="text-[26px] font-medium leading-none tracking-[-0.03em] tabular-nums text-foreground"
            title={payables ? formatIdr(current) : undefined}
          >
            {display}
          </span>
        </div>
      </div>
      <p className="mt-3 flex flex-wrap items-center justify-center gap-x-2 text-sm text-muted-foreground">
        <DeltaBadge value={percentChange(current, prior)} />
        than previous period
      </p>
    </OverviewCard>
  )
}

"use client"

import Link from "next/link"

import type { DashboardData } from "@/app/dashboard/dashboard-types"
import { formatIdr, formatIdrCompact, OverviewCard } from "@/components/dashboard/overview-card"
import { usePermissions } from "@/hooks/use-permissions"
import { VENDOR_INVOICE_MODULE_ENABLED } from "@/lib/feature-flags"
import { cn, getInitialContactName } from "@/lib/utils"

type RankingRow = {
  id: string
  name: string
  code: string
  value: number
  display: string
  title?: string
  href: string
}

function RankingList({
  title,
  description,
  rows,
  empty,
  canNavigate,
}: {
  title: string
  description: string
  rows: RankingRow[]
  empty: string
  canNavigate: boolean
}) {
  const max = Math.max(...rows.map((row) => row.value), 0)

  return (
    <OverviewCard title={title} description={description} className="h-full">
      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ol className="space-y-3.5">
          {rows.map((row, index) => {
            const name = canNavigate ? (
              <Link href={row.href} className="truncate font-medium text-foreground hover:underline">
                {row.name}
              </Link>
            ) : (
              <span className="truncate font-medium text-foreground">{row.name}</span>
            )
            return (
              <li key={row.id} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                    index === 0 ? "brand-fill" : "bg-muted text-foreground"
                  )}
                  aria-label={`Rank ${index + 1}`}
                >
                  {getInitialContactName(row.name).slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-baseline gap-1.5" title={row.name}>
                      {name}
                      <span className="shrink-0 text-xs text-muted-foreground">{row.code}</span>
                    </span>
                    <span className="shrink-0 font-medium tabular-nums text-foreground" title={row.title}>
                      {row.display}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", index === 0 ? "bg-[var(--chart-1)]" : "bg-[var(--chart-2)]")}
                      style={{ width: `${max === 0 ? 0 : Math.max(4, (row.value / max) * 100)}%` }}
                    />
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

export function DashboardRankings({ data }: { data: DashboardData }) {
  const { canRead } = usePermissions()
  const canOpenMasterData = canRead("masterData")

  return (
    <>
      <RankingList
        title="Top Customers"
        description="Most active shipments this period"
        empty="No customer shipment data in this range."
        canNavigate={canOpenMasterData}
        rows={data.topCustomersByShipments.map((customer) => ({
          id: customer.customerId,
          name: customer.customerName,
          code: customer.customerCode,
          value: customer.shipmentCount,
          display: customer.shipmentCount.toLocaleString("id-ID"),
          href: `/dashboard/customers/${customer.customerId}`,
        }))}
      />

      {VENDOR_INVOICE_MODULE_ENABLED ? (
        <>
          <RankingList
            title="Top Vendors"
            description="Most vendor invoices this period"
            empty="No vendor invoice data in this range."
            canNavigate={canOpenMasterData}
            rows={data.topVendorsByVendorInvoiceCount.map((vendor) => ({
              id: vendor.vendorId,
              name: vendor.vendorName,
              code: vendor.vendorCode,
              value: vendor.vendorInvoiceCount,
              display: vendor.vendorInvoiceCount.toLocaleString("id-ID"),
              href: `/dashboard/vendors/${vendor.vendorId}`,
            }))}
          />
          <RankingList
            title="Vendor Spend"
            description="Highest combined invoice amounts"
            empty="No vendor spend data in this range."
            canNavigate={canOpenMasterData}
            rows={data.topVendorsByTotalAmount.map((vendor) => {
              const amount = parseFloat(vendor.totalAmount) || 0
              return {
                id: vendor.vendorId,
                name: vendor.vendorName,
                code: vendor.vendorCode,
                value: amount,
                display: formatIdrCompact(amount),
                title: formatIdr(amount),
                href: `/dashboard/vendors/${vendor.vendorId}`,
              }
            })}
          />
        </>
      ) : null}
    </>
  )
}

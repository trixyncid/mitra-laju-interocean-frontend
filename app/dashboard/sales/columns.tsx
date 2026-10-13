"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { IconArrowRight } from "@tabler/icons-react"

import { ColumnFilterHeader } from "@/components/column-filter/column-filter"
import { formatIdr } from "@/components/dashboard/overview-card"
import { JOB_STATE_LABEL, salesPnl, type JobState } from "@/components/sales/sales-pnl"
import { formatPercent, MARGIN_TONE } from "@/components/sellings/selling-margin"
import { SalesRowActions } from "@/components/sales/sales-row-actions"
import { actionColumn } from "@/lib/data-table"
import { secondaryText } from "@/lib/design"
import { shipmentReference } from "@/lib/shipment-reference"
import { SALES_TYPE_LABEL, type Sales } from "@/lib/types/sales"
import { cn, localDate } from "@/lib/utils"

const STATE_TONE: Record<JobState, string> = { ...MARGIN_TONE, nothing: MARGIN_TONE.uncosted }

type Billing = { label: string; tone: string }

const MUTED = "bg-muted text-muted-foreground"
const WARN = "bg-[var(--mli-warning-container)] text-[var(--mli-on-warning-container)]"
const OK = "bg-[var(--mli-success-container)] text-[var(--mli-on-success-container)]"

/** Where the job's billing stands, from its sellings and their invoices. */
export function salesBilling(sales: Sales): Billing {
  const { sellings } = sales
  if (!sellings.length) return { label: "Nothing to bill", tone: MUTED }
  const billed = sellings.filter((selling) => selling.customerInvoice)
  if (!billed.length) return { label: "Not billed", tone: WARN }
  if (billed.length < sellings.length) return { label: "Partly billed", tone: WARN }
  const unpaid = billed.some((selling) => selling.customerInvoice?.customerInvoiceStatus === "UNPAID")
  return unpaid ? { label: "Billed, unpaid", tone: WARN } : { label: "Paid", tone: OK }
}

/** Whole rupiah keeps the table narrow; the exact amount is in the tooltip. */
const money = (value: number, className?: string) => (
  <span className={cn("block text-right whitespace-nowrap tabular-nums", className)} title={formatIdr(value)}>
    {value.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}
  </span>
)

const rightHeader = (label: string) => <span className="block text-right">{label}</span>

export const columns: ColumnDef<Sales>[] = [
  {
    id: "salesNumber",
    header: () => <ColumnFilterHeader sortKey="salesNumber" label="Sales #" />,
    cell: ({ row }) => (
      <Link
        href={`/dashboard/sales/${row.original.id}`}
        className="font-mono text-[13px] font-semibold whitespace-nowrap text-foreground hover:underline"
      >
        {row.original.salesNumber}
      </Link>
    ),
  },
  {
    id: "customer",
    header: () => <ColumnFilterHeader field="customer" sortKey="customer" label="Customer" />,
    cell: ({ row }) => {
      const customer = row.original.customer
      return customer ? (
        <div className="flex min-w-0 max-w-[14rem] flex-col">
          <span className="truncate text-foreground">{customer.customerName}</span>
          <span className="text-xs text-muted-foreground">{customer.customerCode}</span>
        </div>
      ) : (
        <span className={secondaryText}>No customer</span>
      )
    },
  },
  {
    id: "opened",
    header: () => <ColumnFilterHeader field="opened" sortKey="opened" label="Opened" />,
    cell: ({ row }) => <span className={cn(secondaryText, "whitespace-nowrap")}>{localDate(row.original.createdAt)}</span>,
  },
  {
    id: "revenue",
    header: () => rightHeader("Revenue"),
    cell: ({ row }) => money(salesPnl(row.original).revenue, "text-foreground"),
  },
  {
    id: "cost",
    header: () => rightHeader("Cost"),
    cell: ({ row }) => money(salesPnl(row.original).cost, "text-muted-foreground"),
  },
  {
    id: "profit",
    header: () => rightHeader("Profit · margin"),
    cell: ({ row }) => {
      const { margin, percent, state } = salesPnl(row.original)
      return (
        <div className="flex flex-col items-end gap-1" title={JOB_STATE_LABEL[state]}>
          {money(
            margin,
            cn(
              "font-semibold",
              margin < 0 ? "text-[var(--mli-negative)]" : state === "healthy" ? "text-[var(--mli-positive)]" : "text-foreground"
            )
          )}
          <span className={cn("rounded-full px-2 py-px text-[11px] font-medium whitespace-nowrap tabular-nums", STATE_TONE[state])}>
            {state === "nothing" ? "No sellings" : formatPercent(percent)}
          </span>
        </div>
      )
    },
  },
  {
    id: "billing",
    header: () => <ColumnFilterHeader field="billing" label="Billing" />,
    cell: ({ row }) => {
      const billing = salesBilling(row.original)
      return <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", billing.tone)}>{billing.label}</span>
    },
  },
  {
    id: "jobType",
    header: () => <ColumnFilterHeader field="jobType" label="Job type" />,
    cell: ({ row }) => (
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
          row.original.salesType === "SHIPMENT" ? "bg-secondary text-secondary-foreground" : MUTED
        )}
      >
        {SALES_TYPE_LABEL[row.original.salesType]}
      </span>
    ),
  },
  {
    id: "shipment",
    header: () => <ColumnFilterHeader field="shipmentType" label="Shipment" />,
    cell: ({ row }) => {
      const shipment = row.original.shipment
      if (!shipment) return <span className={secondaryText}>—</span>
      const op = shipment.shipmentOperational
      return (
        <div className="flex min-w-0 max-w-[16rem] flex-col gap-0.5">
          <span className="truncate text-foreground">
            {op?.blNumber ? `BL ${op.blNumber}` : op?.bookingNumber ? `Booking ${op.bookingNumber}` : shipmentReference(shipment)}
          </span>
          <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            {op?.shipmentType ? <span className="font-medium">{op.shipmentType[0] + op.shipmentType.slice(1).toLowerCase()} ·</span> : null}
            {op?.portDeparture?.portName ?? "—"}
            <IconArrowRight className="size-3 shrink-0" />
            {op?.portDestination?.portName ?? "—"}
            {op?.vessel ? ` · ${op.vessel.vesselName}` : ""}
          </span>
        </div>
      )
    },
  },
  {
    ...actionColumn,
    header: "Actions",
    cell: ({ row }) => <SalesRowActions sales={row.original} />,
  },
]

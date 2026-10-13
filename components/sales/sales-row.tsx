"use client"

import { forwardRef } from "react"
import { IconArrowRight } from "@tabler/icons-react"

import { formatIdr, formatIdrCompact } from "@/components/dashboard/overview-card"
import { JOB_STATE_LABEL, salesPnl, type JobState } from "@/components/sales/sales-pnl"
import { formatPercent } from "@/components/sellings/selling-margin"
import { shipmentReference } from "@/lib/shipment-reference"
import { SALES_TYPE_LABEL, type Sales } from "@/lib/types/sales"
import { cn } from "@/lib/utils"

export const JOB_STATE_DOT: Record<JobState, string> = {
  nothing: "bg-input",
  healthy: "bg-[var(--mli-positive)]",
  thin: "bg-[var(--mli-on-backup-container)]",
  loss: "bg-[var(--mli-negative)]",
}

type Props = { sales: Sales; selected?: boolean; onSelect: () => void }

/** Dense list row: the job number, who it's for, what it moved and what it earned. */
export const SalesRow = forwardRef<HTMLButtonElement, Props>(function SalesRow({ sales, selected = false, onSelect }, ref) {
  const { revenue, percent, state } = salesPnl(sales)
  const op = sales.shipment?.shipmentOperational
  const customer = sales.customer?.customerName ?? sales.shipment?.customerCode?.customerName

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      data-sales-id={sales.id}
      className={cn(
        "group relative flex w-full cursor-pointer gap-3 rounded-lg px-3 py-2.5 text-left outline-none transition-colors",
        "focus-visible:ring-[3px] focus-visible:ring-ring/30",
        selected ? "bg-secondary" : "hover:bg-muted"
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-2 left-0 w-[3px] rounded-full transition-colors", selected ? "bg-primary" : "bg-transparent")}
      />
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate font-mono text-[13px] font-semibold text-foreground">{sales.salesNumber}</span>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-px text-[11px] font-medium",
              sales.salesType === "SHIPMENT" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground",
              selected && sales.salesType === "SHIPMENT" && "bg-card"
            )}
          >
            {SALES_TYPE_LABEL[sales.salesType]}
          </span>
          <span className="ml-auto shrink-0 text-sm font-semibold tabular-nums text-foreground" title={`Revenue ${formatIdr(revenue)}`}>
            {sales.sellings.length ? formatIdrCompact(revenue) : "—"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[13px]">
          <span className="truncate text-foreground/85">{customer ?? "No customer"}</span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("size-2 rounded-full", JOB_STATE_DOT[state])} />
            {state === "nothing" ? JOB_STATE_LABEL.nothing : `Margin ${formatPercent(percent)}`}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {sales.shipment ? (
            <>
              {shipmentReference(sales.shipment)}
              {op?.portDeparture || op?.portDestination ? (
                <>
                  {" · "}
                  {op?.portDeparture?.portName ?? "—"} <IconArrowRight className="inline size-3 align-[-1px]" />{" "}
                  {op?.portDestination?.portName ?? "—"}
                </>
              ) : null}
              {" · "}
            </>
          ) : null}
          {sales.costings.length} cost{sales.costings.length === 1 ? "" : "s"} · {sales.sellings.length} charge
          {sales.sellings.length === 1 ? "" : "s"}
        </p>
      </div>
    </button>
  )
})

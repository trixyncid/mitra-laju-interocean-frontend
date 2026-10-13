"use client"

import { forwardRef } from "react"

import { formatIdr, formatIdrCompact } from "@/components/dashboard/overview-card"
import {
  RECONCILIATION_DOT,
  RECONCILIATION_LABEL,
  reconcile,
} from "@/components/costings/costing-reconciliation"
import { costingLabel, type Costing } from "@/lib/types/costing"
import { cn } from "@/lib/utils"

type Props = {
  costing: Costing
  selected?: boolean
  onSelect: () => void
}

/** Dense list row: what the cost is, who it's from, how much, and whether it's been billed. */
export const CostingRow = forwardRef<HTMLButtonElement, Props>(function CostingRow(
  { costing, selected = false, onSelect },
  ref
) {
  const { expected, state } = reconcile(costing)
  const quantity = Number(costing.quantity)

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      data-costing-id={costing.id}
      className={cn(
        "group relative flex w-full cursor-pointer gap-3 rounded-lg px-3 py-2.5 text-left outline-none transition-colors",
        "focus-visible:ring-[3px] focus-visible:ring-ring/30",
        selected ? "bg-secondary" : "hover:bg-muted"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-2 left-0 w-[3px] rounded-full transition-colors",
          selected ? "bg-primary" : "bg-transparent"
        )}
      />
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">{costingLabel(costing)}</span>
          <span className="ml-auto shrink-0 text-sm font-semibold tabular-nums text-foreground" title={formatIdr(expected)}>
            {formatIdrCompact(expected)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[13px]">
          <span className="truncate text-foreground/85">{costing.vendor.vendorName}</span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("size-2 rounded-full", RECONCILIATION_DOT[state])} />
            {RECONCILIATION_LABEL[state]}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {costing.sales ? `${costing.sales.salesNumber} · ` : "No sales job · "}
          {quantity > 1 ? `${quantity} × ` : ""}
          {Number(costing.price).toLocaleString("id-ID", { maximumFractionDigits: 2 })}
          {Number(costing.currencyPrice) !== 1
            ? ` @ ${Number(costing.currencyPrice).toLocaleString("id-ID", { maximumFractionDigits: 2 })}`
            : ""}
        </p>
      </div>
    </button>
  )
})

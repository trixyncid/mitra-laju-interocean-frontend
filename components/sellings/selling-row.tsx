"use client"

import { forwardRef } from "react"

import { formatIdr, formatIdrCompact } from "@/components/dashboard/overview-card"
import { formatPercent, MARGIN_DOT, MARGIN_LABEL, sellingMargin } from "@/components/sellings/selling-margin"
import type { Selling } from "@/lib/types/selling"
import { cn } from "@/lib/utils"

type Props = { selling: Selling; selected?: boolean; onSelect: () => void }

/** Dense list row: the charge, how much, and the margin it earns. */
export const SellingRow = forwardRef<HTMLButtonElement, Props>(function SellingRow({ selling, selected = false, onSelect }, ref) {
  const { revenue, percent, state } = sellingMargin(selling, selling.costings)

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      data-selling-id={selling.id}
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
          <span className="truncate text-sm font-semibold text-foreground">{selling.sellingDescription}</span>
          <span className="ml-auto shrink-0 text-sm font-semibold tabular-nums text-foreground" title={formatIdr(revenue)}>
            {formatIdrCompact(revenue)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[13px]">
          <span className="truncate text-foreground/85">
            {Number(selling.quantity).toLocaleString("id-ID")} × {formatIdr(Number(selling.price) * Number(selling.currencyPrice))}
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("size-2 rounded-full", MARGIN_DOT[state])} />
            {state === "uncosted" ? MARGIN_LABEL.uncosted : `Margin ${formatPercent(percent)}`}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {selling.sales ? `${selling.sales.salesNumber} · ` : "No sales job · "}
          {selling.costings.length} costing{selling.costings.length === 1 ? "" : "s"}
        </p>
      </div>
    </button>
  )
})

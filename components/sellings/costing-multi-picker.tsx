"use client"

import { useState } from "react"
import { IconCheck, IconSearch } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"

import { formatIdr } from "@/components/dashboard/overview-card"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useCostingsQuery } from "@/hooks/use-costings"
import { costingLabel, type Costing } from "@/lib/types/costing"
import { cn, vendorInvoiceLineGross } from "@/lib/utils"

/** Pick any number of costings that aren't recovered through a selling yet. */
export function CostingMultiPicker({
  selected,
  onChange,
  enabled = true,
  salesId,
}: {
  selected: Costing[]
  onChange: (costings: Costing[]) => void
  enabled?: boolean
  /** Prefer costings on this sales job (can be widened by the user). */
  salesId?: string | null
}) {
  const [search, setSearch] = useState("")
  const [sameJobOnly, setSameJobOnly] = useState(true)
  const debounced = useDebouncedValue(search.trim(), 300)
  const scopedToJob = Boolean(salesId) && sameJobOnly
  const { data, isLoading, isFetching } = useCostingsQuery(
    {
      page: 1,
      pageSize: 50,
      search: debounced || undefined,
      selling: "unlinked",
      salesId: scopedToJob ? salesId! : undefined,
    },
    enabled
  )
  const results = data?.items ?? []
  const selectedIds = new Set(selected.map((costing) => costing.id))
  // Keep chosen costings visible even when a search hides them.
  const options = [...selected.filter((costing) => !results.some((r) => r.id === costing.id)), ...results]
  const total = selected.reduce((sum, costing) => sum + vendorInvoiceLineGross(costing), 0)

  const toggle = (costing: Costing) =>
    onChange(selectedIds.has(costing.id) ? selected.filter((c) => c.id !== costing.id) : [...selected, costing])

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[14rem] flex-1">
          <span className="sr-only">Search costings</span>
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search costing, vendor or sales number…"
            className="h-9 w-full rounded-full border border-border bg-card pl-10 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground hover:border-input focus:border-input focus:ring-[3px] focus:ring-ring/10"
          />
          {isFetching ? (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : null}
        </label>
        {salesId ? (
          <button
            type="button"
            role="switch"
            aria-checked={sameJobOnly}
            onClick={() => setSameJobOnly((value) => !value)}
            className={cn(
              "h-9 cursor-pointer rounded-full border px-3 text-xs font-medium transition-colors",
              sameJobOnly ? "border-primary bg-secondary text-secondary-foreground" : "border-border text-muted-foreground"
            )}
          >
            Same sales job only
          </button>
        ) : null}
      </div>
      <div role="group" aria-label="Costings" className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
        {isLoading && options.length === 0 ? (
          <p className="py-5 text-center text-sm text-muted-foreground">Loading…</p>
        ) : options.length === 0 ? (
          <p className="rounded-xl bg-muted/70 px-3 py-5 text-center text-sm text-muted-foreground">
            {scopedToJob
              ? "No unlinked costings on this sales job. Turn off “Same sales job only” to see all."
              : "No unlinked costings found."}
          </p>
        ) : (
          options.map((costing) => {
            const checked = selectedIds.has(costing.id)
            return (
              <button
                key={costing.id}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => toggle(costing)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-xl border p-2.5 text-left transition-colors",
                  checked ? "border-primary bg-secondary" : "border-border hover:border-input hover:bg-muted/60"
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-md border",
                    checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card"
                  )}
                >
                  {checked ? <IconCheck className="size-3.5" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{costingLabel(costing)}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {costing.vendor.vendorName}
                    {costing.sales ? ` · ${costing.sales.salesNumber}` : ""}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-medium tabular-nums">{formatIdr(vendorInvoiceLineGross(costing))}</span>
              </button>
            )
          })
        )}
      </div>
      {selected.length > 0 ? (
        <p className="px-1 text-xs text-muted-foreground">
          {selected.length} costing{selected.length === 1 ? "" : "s"} selected · cost before tax{" "}
          <span className="font-medium text-foreground tabular-nums">{formatIdr(total)}</span>
        </p>
      ) : null}
    </div>
  )
}

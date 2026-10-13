"use client"

import { useState } from "react"
import { IconCheck, IconPlus, IconSearch } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"

import { formatIdr } from "@/components/dashboard/overview-card"
import { Button } from "@/components/ui/button"
import { useCostingsQuery } from "@/hooks/use-costings"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useInfiniteSellingLines } from "@/hooks/use-selling-lines"
import { costingLabel, type Costing } from "@/lib/types/costing"
import type { Selling } from "@/lib/types/selling"
import { cn, vendorInvoiceLineGross } from "@/lib/utils"

/** What the picker needs from a costing or selling line. */
export type PickedLine = {
  id: string
  title: string
  subtitle: string
  gross: number
  /** Created from this picker, so it gets a "New" tag. */
  isNew?: boolean
}

export type SalesLineKind = "costings" | "sellings"

const COPY: Record<SalesLineKind, { search: string; empty: string; noun: [string, string] }> = {
  costings: {
    search: "Search costing or vendor…",
    empty: "No costings outside a sales job.",
    noun: ["costing", "costings"],
  },
  sellings: {
    search: "Search selling…",
    empty: "No sellings outside a sales job.",
    noun: ["selling", "sellings"],
  },
}

export const costingToLine = (costing: Costing): PickedLine => ({
  id: costing.id,
  title: costingLabel(costing),
  subtitle: costing.vendor.vendorName,
  gross: vendorInvoiceLineGross(costing),
})

export const sellingToLine = (selling: Selling): PickedLine => ({
  id: selling.id,
  title: selling.sellingDescription,
  subtitle: `${Number(selling.quantity).toLocaleString("id-ID")} × ${formatIdr(Number(selling.price) * Number(selling.currencyPrice))}`,
  gross: vendorInvoiceLineGross(selling),
})

function useFreeLines(kind: SalesLineKind, search: string, enabled: boolean) {
  const costings = useCostingsQuery(
    { page: 1, pageSize: 50, search: search || undefined, sales: "unassigned" },
    enabled && kind === "costings"
  )
  const sellings = useInfiniteSellingLines(
    { pageSize: 50, search: search || undefined, sales: "unassigned" },
    enabled && kind === "sellings"
  )
  if (kind === "costings") {
    const lines = (costings.data?.items ?? []).map(costingToLine)
    return { lines, isLoading: costings.isLoading, isFetching: costings.isFetching }
  }
  const lines = (sellings.data?.pages[0]?.items ?? []).map(sellingToLine)
  return { lines, isLoading: sellings.isLoading, isFetching: sellings.isFetching }
}

/** Pick any number of costing or selling lines that aren't in a sales job yet. */
export function SalesLinePicker({
  kind,
  selected,
  onChange,
  enabled = true,
  onCreate,
}: {
  kind: SalesLineKind
  selected: PickedLine[]
  onChange: (lines: PickedLine[]) => void
  enabled?: boolean
  /** Opens a form for a new line; gets what was searched for to prefill it. */
  onCreate?: (search: string) => void
}) {
  const [search, setSearch] = useState("")
  const trimmed = search.trim()
  // The search text goes into the new line's form, so clear it: the new line then shows among the selected ones.
  const create = () => {
    onCreate?.(trimmed)
    setSearch("")
  }
  const debounced = useDebouncedValue(trimmed, 300)
  const { lines, isLoading, isFetching } = useFreeLines(kind, debounced, enabled)
  const copy = COPY[kind]
  const selectedIds = new Set(selected.map((line) => line.id))
  // Keep chosen lines visible even when a search hides them.
  const options = [...selected.filter((line) => !lines.some((l) => l.id === line.id)), ...lines]
  const total = selected.reduce((sum, line) => sum + line.gross, 0)

  const toggle = (line: PickedLine) =>
    onChange(selectedIds.has(line.id) ? selected.filter((l) => l.id !== line.id) : [...selected, line])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
      <label className="relative block min-w-0 flex-1">
        <span className="sr-only">{copy.search}</span>
        <IconSearch className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            // Enter must not save the whole sales job; with no match it starts a new line instead.
            if (event.key !== "Enter") return
            event.preventDefault()
            if (onCreate && trimmed && !isFetching && lines.length === 0) create()
          }}
          placeholder={copy.search}
          className="h-9 w-full rounded-full border border-border bg-card pl-10 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground hover:border-input focus:border-input focus:ring-[3px] focus:ring-ring/10"
        />
        {isFetching ? (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </label>
      {onCreate ? (
        <Button type="button" variant="outline" size="sm" className="shrink-0 rounded-full" onClick={() => create()}>
          <IconPlus className="size-4" />
          New {copy.noun[0]}
        </Button>
      ) : null}
      </div>
      <div role="group" aria-label={copy.noun[1]} className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
        {isLoading && options.length === 0 ? (
          <p className="py-5 text-center text-sm text-muted-foreground">Loading…</p>
        ) : options.length === 0 ? (
          <div className="flex flex-col items-center gap-2.5 rounded-xl bg-muted/70 px-3 py-5 text-center">
            <p className="text-sm text-muted-foreground">
              {debounced ? `No ${copy.noun[0]} matches “${debounced}”.` : copy.empty}
            </p>
            {onCreate ? (
              <Button type="button" size="sm" onClick={() => create()}>
                <IconPlus className="size-4" />
                {trimmed ? `Create “${trimmed}”` : `Create a ${copy.noun[0]}`}
              </Button>
            ) : null}
            {onCreate && trimmed ? <p className="text-xs text-muted-foreground">or press Enter</p> : null}
          </div>
        ) : (
          <>
          {options.map((line) => {
            const checked = selectedIds.has(line.id)
            return (
              <button
                key={line.id}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => toggle(line)}
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
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium text-foreground">{line.title}</span>
                    {line.isNew ? (
                      <span className="shrink-0 rounded-full bg-[var(--mli-success-container)] px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-[var(--mli-on-success-container)]">
                        New
                      </span>
                    ) : null}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">{line.subtitle}</span>
                </span>
                <span className="shrink-0 text-sm font-medium tabular-nums">{formatIdr(line.gross)}</span>
              </button>
            )
          })}
          {onCreate && debounced ? (
            <button
              type="button"
              onClick={() => create()}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed border-input p-2.5 text-left text-sm text-muted-foreground transition-colors hover:border-primary hover:bg-muted/60 hover:text-foreground"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted">
                <IconPlus className="size-3.5" />
              </span>
              <span className="truncate">
                Create “{trimmed}” as a new {copy.noun[0]}
              </span>
            </button>
          ) : null}
          </>
        )}
      </div>
      {selected.length > 0 ? (
        <p className="px-1 text-xs text-muted-foreground">
          {selected.length} {copy.noun[selected.length === 1 ? 0 : 1]} selected · before tax{" "}
          <span className="font-medium text-foreground tabular-nums">{formatIdr(total)}</span>
        </p>
      ) : null}
    </div>
  )
}

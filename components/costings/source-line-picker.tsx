"use client"

import { useState } from "react"
import { IconCheck, IconSearch } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"

import { formatIdr } from "@/components/dashboard/overview-card"
import { useUnassignedBreakdownSearch } from "@/hooks/use-entity-searches"
import { cn, localDate, vendorInvoiceInvoiceLineNet } from "@/lib/utils"
import type { VendorInvoiceBreakdownListItem } from "@/services/vendor-invoice.service"

/** The bits of a vendor invoice line the costing form needs to show and compute from. */
export type SourceLine = Pick<
  VendorInvoiceBreakdownListItem,
  "id" | "productDescription" | "quantity" | "price" | "currencyPrice" | "vatPercentage" | "pph23Percentage" | "containerNumber"
> & {
  vendorInvoice: {
    id: string
    vendorInvoiceNumber: string
    vendorInvoiceDate?: string | null
    status: string
    vendor?: { id?: string; vendorName: string; vendorCode?: string | null } | null
  }
}

function LineOption({
  line,
  selected,
  onSelect,
}: {
  line: SourceLine
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition-colors",
        selected ? "border-primary bg-secondary" : "border-border hover:border-input hover:bg-muted/60"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card"
        )}
      >
        {selected ? <IconCheck className="size-3.5" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">{line.productDescription}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {line.vendorInvoice.vendor?.vendorName ?? "—"} ·{" "}
          <span className="font-mono">{line.vendorInvoice.vendorInvoiceNumber}</span>
          {line.vendorInvoice.vendorInvoiceDate ? ` · ${localDate(line.vendorInvoice.vendorInvoiceDate)}` : ""}
          {line.containerNumber ? ` · ${line.containerNumber}` : ""}
        </span>
      </span>
      <span className="shrink-0 text-sm font-medium tabular-nums">{formatIdr(vendorInvoiceInvoiceLineNet(line))}</span>
    </button>
  )
}

/** Pick exactly one vendor invoice line that isn't matched to a costing yet. */
export function SourceLinePicker({
  value,
  onChange,
  enabled = true,
  error,
}: {
  value: SourceLine | null
  onChange: (line: SourceLine) => void
  enabled?: boolean
  error?: string
}) {
  const [search, setSearch] = useState("")
  const { data, isLoading, isFetching } = useUnassignedBreakdownSearch(search, enabled, 30)
  const results = (data?.items ?? []) as SourceLine[]
  // Keep the chosen line visible even when it's outside the current results
  // (e.g. a costing's own line, which no longer counts as unmatched).
  const lines = value && !results.some((line) => line.id === value.id) ? [value, ...results] : results

  return (
    <div className="space-y-2">
      <label className="relative block">
        <span className="sr-only">Search vendor invoice lines</span>
        <IconSearch className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search description, invoice number, vendor or container…"
          className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground hover:border-input focus:border-input focus:ring-[3px] focus:ring-ring/10"
        />
        {isFetching ? (
          <Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </label>
      <div role="radiogroup" aria-label="Vendor invoice line" className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {isLoading && lines.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
        ) : lines.length === 0 ? (
          <p className="rounded-xl bg-muted/70 px-3 py-6 text-center text-sm text-muted-foreground">
            {search ? "No unmatched lines match your search." : "Every vendor invoice line is already matched to a costing."}
          </p>
        ) : (
          lines.map((line) => (
            <LineOption key={line.id} line={line} selected={value?.id === line.id} onSelect={() => onChange(line)} />
          ))
        )}
      </div>
      {error ? <p className="text-xs text-[var(--mli-on-error-container)]">{error}</p> : null}
    </div>
  )
}

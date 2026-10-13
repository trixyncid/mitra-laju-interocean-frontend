"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useUnassignedBreakdownSearch } from "@/hooks/use-entity-searches"
import { cn, localDate, vendorInvoiceInvoiceLineNet } from "@/lib/utils"

function formatIdr(value: number) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

/** Searchable checklist of vendor invoice lines that are not in any costing yet. */
export function UnassignedLinesPicker({
  selectedIds,
  onSelectedIdsChange,
  enabled = true,
  vendorId,
}: {
  selectedIds: string[]
  onSelectedIdsChange: (ids: string[]) => void
  enabled?: boolean
  /** Only show lines invoiced by this vendor. */
  vendorId?: string
}) {
  const [search, setSearch] = useState("")
  const { data, isLoading, isFetching } = useUnassignedBreakdownSearch(
    search,
    enabled,
    50,
    vendorId
  )
  const lines = data?.items ?? []
  const selected = new Set(selectedIds)

  function toggle(id: string, checked: boolean) {
    onSelectedIdsChange(
      checked ? [...selectedIds, id] : selectedIds.filter((value) => value !== id)
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search description, container, vendor, invoice…"
        />
        {isFetching ? (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <div className="max-h-[45vh] space-y-2 overflow-y-auto">
        {isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
        ) : lines.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {vendorId
              ? "No unmatched lines from this vendor. Untick the vendor filter to see other vendors."
              : "No unassigned vendor invoice lines found."}
          </p>
        ) : (
          lines.map((line) => {
            const checked = selected.has(line.id)
            return (
              <label
                key={line.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 transition-colors hover:border-input",
                  checked && "border-primary/40 bg-secondary"
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) => toggle(line.id, value === true)}
                  className="mt-0.5"
                />
                <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium">{line.productDescription}</p>
                    <p className="text-xs text-muted-foreground">
                      {line.vendorInvoice.vendor?.vendorName ?? "—"} ·{" "}
                      {line.vendorInvoice.vendorInvoiceNumber}
                      {line.vendorInvoice.vendorInvoiceDate
                        ? ` · ${localDate(line.vendorInvoice.vendorInvoiceDate)}`
                        : ""}
                      {line.containerNumber ? ` · ${line.containerNumber}` : ""}
                    </p>
                  </div>
                  <p className="text-sm font-medium tabular-nums">
                    {formatIdr(vendorInvoiceInvoiceLineNet(line))}
                  </p>
                </div>
              </label>
            )
          })
        )}
      </div>

      {selectedIds.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          {selectedIds.length} line{selectedIds.length === 1 ? "" : "s"} selected
        </p>
      ) : null}
    </div>
  )
}

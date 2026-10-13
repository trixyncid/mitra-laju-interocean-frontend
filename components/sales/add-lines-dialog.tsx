"use client"

import { useState, type ReactNode } from "react"
import {
  IconArrowRight,
  IconCalculator,
  IconCheck,
  IconClockHour4,
  IconLink,
  IconPlus,
  IconSearch,
  IconSparkles,
  IconTag,
} from "@tabler/icons-react"
import { Loader2 } from "lucide-react"

import { formatIdr } from "@/components/dashboard/overview-card"
import { salesPnl } from "@/components/sales/sales-pnl"
import type { SalesLineKind } from "@/components/sales/sales-line-picker"
import { formatPercent, linkedCostingLabel } from "@/components/sellings/selling-margin"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useInfiniteCostings } from "@/hooks/use-costings"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useLinkSalesLines } from "@/hooks/use-sales"
import { useInfiniteSellingLines } from "@/hooks/use-selling-lines"
import { costingLabel } from "@/lib/types/costing"
import type { Sales } from "@/lib/types/sales"
import { cn, vendorInvoiceLineGross } from "@/lib/utils"

/** A free costing or selling line, shaped for the list. */
type FreeLine = {
  id: string
  title: string
  party: string
  gross: number
  createdAt: string
  /** Why this line probably belongs to this job. */
  reasons: string[]
  /** Extra lines that come along when this one is added. */
  brings: { text: string; cost: number } | null
}

const COPY: Record<SalesLineKind, { one: string; many: string; search: string; icon: ReactNode }> = {
  sellings: {
    one: "selling",
    many: "sellings",
    search: "Search by description or customer",
    icon: <IconTag className="size-6" />,
  },
  costings: {
    one: "costing",
    many: "costings",
    search: "Search by description or vendor",
    icon: <IconCalculator className="size-6" />,
  },
}

/** Lines older than this get an amber "waiting" label, so forgotten ones stand out. */
const STALE_DAYS = 30

function daysSince(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000))
}

function waitingText(days: number) {
  if (days === 0) return "Added today"
  if (days === 1) return "Waiting 1 day"
  return `Waiting ${days} days`
}

function useFreeLines(kind: SalesLineKind, sales: Sales, search: string, enabled: boolean) {
  const params = { pageSize: 30, search: search || undefined, sales: "unassigned" as const }
  const costings = useInfiniteCostings(params, enabled && kind === "costings")
  const sellings = useInfiniteSellingLines(params, enabled && kind === "sellings")
  const query = kind === "costings" ? costings : sellings

  const jobCostingIds = new Set(sales.costings.map((costing) => costing.id))
  const jobSellingIds = new Set(sales.sellings.map((selling) => selling.id))
  const jobVendorIds = new Set(sales.costings.map((costing) => costing.vendor.id))

  const lines: FreeLine[] =
    kind === "costings"
      ? (costings.data?.pages ?? []).flatMap((page) =>
          page.items.map((costing) => {
            const reasons: string[] = []
            if (costing.selling && jobSellingIds.has(costing.selling.id)) reasons.push("Charged on a selling in this job")
            if (jobVendorIds.has(costing.vendor.id)) reasons.push("Vendor already in this job")
            return {
              id: costing.id,
              title: costingLabel(costing),
              party: costing.vendor.vendorName,
              gross: vendorInvoiceLineGross(costing),
              createdAt: costing.createdAt,
              reasons,
              brings:
                costing.selling && !jobSellingIds.has(costing.selling.id)
                  ? { text: `Brings its selling: ${costing.selling.sellingDescription}`, cost: 0 }
                  : null,
            }
          })
        )
      : (sellings.data?.pages ?? []).flatMap((page) =>
          page.items.map((selling) => {
            const reasons: string[] = []
            const extra = selling.costings.filter((costing) => !jobCostingIds.has(costing.id))
            const extraCost = extra.reduce((sum, costing) => sum + vendorInvoiceLineGross(costing), 0)
            return {
              id: selling.id,
              title: selling.sellingDescription,
              party: `${Number(selling.quantity).toLocaleString("id-ID")} × ${formatIdr(Number(selling.price) * Number(selling.currencyPrice))}`,
              gross: vendorInvoiceLineGross(selling),
              createdAt: selling.createdAt,
              reasons,
              brings: extra.length
                ? {
                    text:
                      extra.length === 1
                        ? `Brings 1 cost: ${linkedCostingLabel(extra[0])}`
                        : `Brings ${extra.length} costs (${formatIdr(extraCost)})`,
                    cost: extraCost,
                  }
                : null,
            }
          })
        )

  const total = query.data?.pages[0]?.pagination.total ?? lines.length
  return {
    lines,
    total,
    isLoading: query.isLoading,
    isFetching: query.isFetching && !query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: () => query.fetchNextPage(),
  }
}

function LineRow({ line, checked, onToggle }: { line: FreeLine; checked: boolean; onToggle: () => void }) {
  const days = daysSince(line.createdAt)
  const stale = days >= STALE_DAYS
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={onToggle}
        className={cn(
          "flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30",
          checked ? "border-primary bg-secondary" : "border-border bg-card hover:border-input hover:bg-muted/60"
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
            checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card"
          )}
        >
          {checked ? <IconCheck className="size-3.5" /> : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-3">
            <span className="line-clamp-2 text-sm font-medium break-words text-foreground">{line.title}</span>
            <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">{formatIdr(line.gross)}</span>
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="truncate">{line.party}</span>
            <span
              className={cn(
                "inline-flex items-center gap-1",
                stale && "rounded-full bg-[var(--mli-warning-container)] px-2 py-px font-medium text-[var(--mli-on-warning-container)]"
              )}
            >
              <IconClockHour4 className="size-3.5" />
              {waitingText(days)}
            </span>
          </span>
          {line.reasons.length || line.brings ? (
            <span className="mt-1.5 flex flex-wrap gap-1.5">
              {line.reasons.map((reason) => (
                <span
                  key={reason}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-px text-[11px] font-medium text-primary"
                >
                  <IconSparkles className="size-3" />
                  {reason}
                </span>
              ))}
              {line.brings ? (
                <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-muted px-2 py-px text-[11px] font-medium text-muted-foreground">
                  <IconLink className="size-3 shrink-0" />
                  <span className="truncate">{line.brings.text}</span>
                </span>
              ) : null}
            </span>
          ) : null}
        </span>
      </button>
    </li>
  )
}

/** Before → after profit for the job, so people see what adding does before they confirm. */
function ImpactPreview({ sales, kind, picked }: { sales: Sales; kind: SalesLineKind; picked: FreeLine[] }) {
  const before = salesPnl(sales)
  const pickedGross = picked.reduce((sum, line) => sum + line.gross, 0)
  const broughtCost = picked.reduce((sum, line) => sum + (line.brings?.cost ?? 0), 0)
  const revenue = before.revenue + (kind === "sellings" ? pickedGross : 0)
  const cost = before.cost + (kind === "costings" ? pickedGross : 0) + broughtCost
  const margin = revenue - cost
  const percent = revenue > 0 ? (margin / revenue) * 100 : 0
  const bringsSelling = kind === "costings" && picked.some((line) => line.brings)

  const profit = (value: number, pct: number, hasRevenue: boolean) => (
    <span className={cn("tabular-nums", value < 0 && "text-[var(--mli-negative)]")}>
      {formatIdr(value)}
      {hasRevenue ? <span className="text-muted-foreground"> · {formatPercent(pct)}</span> : null}
    </span>
  )

  return (
    <div className="rounded-xl border border-border bg-muted/50 p-3">
      <p className="text-xs font-medium text-muted-foreground">
        {picked.length} {picked.length === 1 ? COPY[kind].one : COPY[kind].many} selected ·{" "}
        <span className="tabular-nums text-foreground">{formatIdr(pickedGross)}</span> before tax
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="text-muted-foreground">Job profit</span>
        {profit(before.margin, before.percent, before.revenue > 0)}
        <IconArrowRight className="size-4 text-muted-foreground" />
        <span className="font-semibold">{profit(margin, percent, revenue > 0)}</span>
      </div>
      {bringsSelling ? (
        <p className="mt-1 text-[11px] text-muted-foreground">
          Some costs bring their selling along. That selling&apos;s revenue is added too, so the final profit may be higher.
        </p>
      ) : null}
    </div>
  )
}

/**
 * The one way to add sellings or costings to a job: pick from lines that
 * aren't in any job yet (best matches first), or create a new one.
 */
export function AddLinesDialog({
  sales,
  kind,
  open,
  onOpenChange,
  onCreateNew,
}: {
  sales: Sales
  kind: SalesLineKind
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when the user may create lines; closes this dialog and opens the form. */
  onCreateNew?: () => void
}) {
  const copy = COPY[kind]
  const [search, setSearch] = useState("")
  const [picked, setPicked] = useState<FreeLine[]>([])
  const debounced = useDebouncedValue(search.trim(), 300)
  const free = useFreeLines(kind, sales, debounced, open)
  const link = useLinkSalesLines(sales.id, kind)

  const pickedIds = new Set(picked.map((line) => line.id))
  // Chosen lines stay on screen even when a search hides them.
  const shown = [...picked.filter((line) => !free.lines.some((l) => l.id === line.id)), ...free.lines]
  const suggested = shown.filter((line) => line.reasons.length > 0)
  const others = shown.filter((line) => line.reasons.length === 0)
  const nothingWaiting = !free.isLoading && !debounced && free.lines.length === 0

  const toggle = (line: FreeLine) =>
    setPicked((prev) => (prev.some((l) => l.id === line.id) ? prev.filter((l) => l.id !== line.id) : [...prev, line]))

  // The parent mounts this dialog fresh each time, so search and ticks start empty.
  const setOpen = (next: boolean) => {
    if (!link.isPending) onOpenChange(next)
  }

  const group = (title: string, hint: string | null, lines: FreeLine[]) =>
    lines.length ? (
      <section aria-label={title} className="space-y-2">
        <div className="flex items-baseline justify-between gap-2 px-1">
          <h4 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</h4>
          {hint ? <span className="text-[11px] text-muted-foreground">{hint}</span> : null}
        </div>
        <ul className="space-y-2">
          {lines.map((line) => (
            <LineRow key={line.id} line={line} checked={pickedIds.has(line.id)} onToggle={() => toggle(line)} />
          ))}
        </ul>
      </section>
    ) : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[92svh] flex-col gap-4 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add {copy.many} to {sales.salesNumber}</DialogTitle>
          <DialogDescription>
            {nothingWaiting
              ? `Every ${copy.one} is already in a sales job.`
              : `These ${copy.many} are not in any sales job yet. Tick the ones that belong here.`}{" "}
            {kind === "sellings"
              ? "Costs linked to a selling come along by themselves."
              : "The selling a cost is charged on comes along by itself."}
          </DialogDescription>
        </DialogHeader>

        {nothingWaiting ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">{copy.icon}</span>
            <div>
              <p className="text-sm font-medium text-foreground">Nothing is waiting</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {onCreateNew ? `Create a new ${copy.one} for this job instead.` : `There are no free ${copy.many} to add.`}
              </p>
            </div>
            {onCreateNew ? (
              <Button onClick={onCreateNew}>
                <IconPlus className="size-4" />
                New {copy.one}
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <label className="relative block">
              <span className="sr-only">{copy.search}</span>
              <IconSearch className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={copy.search}
                autoFocus
                className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground hover:border-input focus:border-input focus:ring-[3px] focus:ring-ring/10"
              />
              {free.isFetching ? (
                <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              ) : null}
            </label>

            <div className="-mx-1 min-h-40 flex-1 space-y-5 overflow-y-auto px-1">
              {free.isLoading && shown.length === 0 ? (
                <ul className="space-y-2" aria-label="Loading">
                  {[0, 1, 2].map((key) => (
                    <li key={key} className="h-[72px] animate-pulse rounded-xl bg-muted" />
                  ))}
                </ul>
              ) : shown.length === 0 ? (
                <p className="rounded-xl bg-muted/70 px-3 py-8 text-center text-sm text-muted-foreground">
                  No {copy.many} match &ldquo;{debounced}&rdquo;.
                </p>
              ) : (
                <>
                  {group("Best match for this job", null, suggested)}
                  {group(
                    suggested.length ? `Other waiting ${copy.many}` : `Waiting ${copy.many}`,
                    debounced ? null : `${free.total} not in a job`,
                    others
                  )}
                  {free.hasNextPage ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      disabled={free.isFetchingNextPage}
                      onClick={free.fetchNextPage}
                    >
                      {free.isFetchingNextPage ? "Loading…" : "Show more"}
                    </Button>
                  ) : null}
                </>
              )}
            </div>

            {picked.length ? <ImpactPreview sales={sales} kind={kind} picked={picked} /> : null}
          </>
        )}

        <DialogFooter className="items-center gap-2 sm:justify-between">
          {onCreateNew && !nothingWaiting ? (
            <p className="mr-auto text-sm text-muted-foreground">
              Not in the list?{" "}
              <button
                type="button"
                onClick={onCreateNew}
                className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline"
              >
                Create a new {copy.one}
              </button>
            </p>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" disabled={link.isPending} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {nothingWaiting ? null : (
              <Button
                disabled={picked.length === 0 || link.isPending}
                onClick={() => link.mutate(picked.map((line) => line.id), { onSuccess: () => onOpenChange(false) })}
              >
                {link.isPending
                  ? "Adding…"
                  : picked.length
                    ? `Add ${picked.length} ${picked.length === 1 ? copy.one : copy.many}`
                    : `Add ${copy.many}`}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

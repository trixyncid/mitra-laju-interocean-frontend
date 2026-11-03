"use client"

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { IconArrowUp, IconCalculator, IconSearch, IconX } from "@tabler/icons-react"

import {
  COSTING_FILTER_FIELDS,
  COSTING_FILTER_PILLS,
  COSTING_SORT_LABELS,
} from "@/app/dashboard/costings/column-filter-fields"
import { ColumnFilterBar, ColumnFilterProvider } from "@/components/column-filter/column-filter"
import { columnValues } from "@/components/column-filter/types"
import { CostingPanel } from "@/components/costings/costing-panel"
import { CostingRow } from "@/components/costings/costing-row"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { formatIdr, formatIdrCompact } from "@/components/dashboard/overview-card"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { TableExportButton } from "@/components/table-export-button"
import { useInfiniteCostings } from "@/hooks/use-costings"
import { useIsDesktop } from "@/hooks/use-is-desktop"
import { costingKeys } from "@/lib/query-keys"
import { costingService } from "@/services/costing.service"

const BATCH_SIZE = 30
const SEARCH_DELAY_MS = 300

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
}

/** Selects a costing via the URL so links, refresh and back all keep it. */
export function useCostingSelection() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selected = searchParams.get("costing")
  const select = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (id) params.set("costing", id)
      else params.delete("costing")
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )
  return { selected, select }
}

export function CostingWorkspace({
  applied,
  onApply,
  enabled,
}: {
  applied: AppliedTableFilters
  onApply: (next: AppliedTableFilters) => void
  enabled: boolean
}) {
  const isDesktop = useIsDesktop()
  const { selected: selectedParam, select } = useCostingSelection()

  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const searchTimer = useRef<number | undefined>(undefined)
  const itemRefs = useRef(new Map<string, HTMLButtonElement>())
  const [draftSearch, setDraftSearch] = useState(applied.search)
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Excel-style column filters replace the old Billed / vendor controls.
  const listParams = {
    search: applied.search || undefined,
    columns: columnValues(applied.columns, COSTING_FILTER_FIELDS),
    sortBy: applied.sort?.by,
    sortDir: applied.sort?.dir,
  }

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteCostings(
    { pageSize: BATCH_SIZE, ...listParams },
    enabled
  )

  const costings = data?.pages.flatMap((page) => page.items) ?? []
  const total = data?.pages[0]?.pagination.total ?? 0
  const summary = data?.pages[0]?.summary
  const expectedTotal = Number(summary?.net ?? 0)
  const billedTotal = Number(summary?.billed ?? 0)

  // On desktop the first costing is shown by default so the panel is never empty.
  const activeId = selectedParam ?? (isDesktop ? costings[0]?.id : undefined)

  const applyFilters = useCallback(
    (patch: Partial<AppliedTableFilters>) => {
      select(null)
      onApply({ ...applied, ...patch })
      scrollRef.current?.scrollTo({ top: 0 })
    },
    [applied, onApply, select]
  )

  const onSearchChange = (value: string) => {
    setDraftSearch(value)
    window.clearTimeout(searchTimer.current)
    searchTimer.current = window.setTimeout(() => applyFilters({ search: value.trim() }), SEARCH_DELAY_MS)
  }

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage()
      },
      { root: isDesktop ? scrollRef.current : null, rootMargin: "480px" }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isDesktop, isFetchingNextPage, costings.length])

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "/" || isTypingTarget(event.target)) return
      event.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => () => window.clearTimeout(searchTimer.current), [])

  const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const down = event.key === "ArrowDown" || event.key === "j"
    const up = event.key === "ArrowUp" || event.key === "k"
    if (!down && !up) return
    event.preventDefault()
    const index = costings.findIndex((costing) => costing.id === activeId)
    const nextIndex = down ? Math.min(costings.length - 1, index + 1) : Math.max(0, index - 1)
    if (down && nextIndex >= costings.length - 3 && hasNextPage && !isFetchingNextPage) void fetchNextPage()
    const next = costings[nextIndex]
    if (!next) return
    select(next.id)
    const node = itemRefs.current.get(next.id)
    node?.focus({ preventScroll: true })
    node?.scrollIntoView({ block: "nearest" })
  }

  const hasFilters =
    Boolean(applied.search) || Object.keys(listParams.columns).length > 0 || Boolean(applied.sort)
  const billedShare = expectedTotal > 0 ? Math.min(100, (billedTotal / expectedTotal) * 100) : 0

  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 lg:h-[calc(100svh-13.75rem)] lg:min-h-[560px] lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
      <section aria-label="Costing list" className="relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl surface">
        <div className="space-y-3 border-b border-border p-3">
          <div className="flex items-center gap-2">
            <label className="relative block min-w-0 flex-1">
              <span className="sr-only">Search costings</span>
              <IconSearch className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchRef}
                value={draftSearch}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search description, vendor or sales number…"
                className="h-10 w-full rounded-full bg-muted pl-10 pr-16 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:bg-card focus:ring-[3px] focus:ring-ring/15"
              />
              {draftSearch ? (
                <button
                  type="button"
                  onClick={() => {
                    setDraftSearch("")
                    window.clearTimeout(searchTimer.current)
                    applyFilters({ search: "" })
                  }}
                  className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Clear search"
                >
                  <IconX className="size-4" />
                </button>
              ) : (
                <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-card px-1.5 text-[11px] text-muted-foreground lg:block">
                  /
                </kbd>
              )}
            </label>
            <TableExportButton
              compact
              module="COSTING"
              noun="costing lines"
              totalRows={total}
              onExport={() => costingService.exportExcel(listParams)}
            />
          </div>

          <ColumnFilterProvider
            columns={applied.columns}
            sort={applied.sort}
            fields={COSTING_FILTER_FIELDS}
            sortLabels={COSTING_SORT_LABELS}
            onChange={({ columns, sort }) => applyFilters({ columns, sort })}
            facetKey={[...costingKeys.all, "facets", listParams]}
            fetchFacets={(field) => costingService.getFacets(field, listParams)}
          >
            <ColumnFilterBar items={COSTING_FILTER_PILLS} className="-mx-3 px-3" />
          </ColumnFilterProvider>

          {summary && !isLoading ? (
            <div className="rounded-xl bg-muted/70 p-3" aria-live="polite">
              <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
                <span>
                  <span className="font-medium text-foreground tabular-nums">{total.toLocaleString("id-ID")}</span> lines ·{" "}
                  {summary.matchedLines.toLocaleString("id-ID")} billed
                </span>
                <span title={`Billed ${formatIdr(billedTotal)} of expected ${formatIdr(expectedTotal)}`}>
                  <span className="font-medium text-foreground tabular-nums">{formatIdrCompact(billedTotal)}</span> of{" "}
                  <span className="tabular-nums">{formatIdrCompact(expectedTotal)}</span>
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card">
                <div className="h-full rounded-full bg-primary" style={{ width: `${billedShare}%` }} />
              </div>
            </div>
          ) : null}
        </div>

        <div
          ref={scrollRef}
          role="list"
          aria-label="Costing lines"
          aria-busy={isLoading || isFetchingNextPage}
          onKeyDown={onListKeyDown}
          onScroll={(event) => setShowBackToTop(event.currentTarget.scrollTop > 600)}
          className="min-h-0 flex-1 p-2 lg:overflow-y-auto"
        >
          {isLoading ? (
            <div className="space-y-1">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-[76px] rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">{error.message}</p>
          ) : costings.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <IconCalculator className="size-6 text-muted-foreground" />
              </span>
              <p className="font-medium text-foreground">{hasFilters ? "No costing lines match" : "No costing lines yet"}</p>
              {hasFilters ? (
                <button
                  type="button"
                  className="cursor-pointer text-sm font-medium text-primary hover:underline"
                  onClick={() => {
                    setDraftSearch("")
                    applyFilters({ search: "", columns: undefined, sort: undefined })
                  }}
                >
                  Clear search and filters
                </button>
              ) : (
                <p className="max-w-xs text-sm text-muted-foreground">
                  Add the costs you expect from each vendor, then match their invoices as they arrive.
                </p>
              )}
            </div>
          ) : (
            <>
              {costings.map((costing) => (
                <div role="listitem" key={costing.id}>
                  <CostingRow
                    ref={(node) => {
                      if (node) itemRefs.current.set(costing.id, node)
                      else itemRefs.current.delete(costing.id)
                    }}
                    costing={costing}
                    selected={costing.id === activeId}
                    onSelect={() => select(costing.id)}
                  />
                </div>
              ))}
              <div ref={sentinelRef} aria-hidden className="h-px" />
              {isFetchingNextPage ? (
                <div className="space-y-1 pt-1">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-[76px] rounded-lg" />
                  ))}
                </div>
              ) : !hasNextPage ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  That&apos;s all {total.toLocaleString("id-ID")} costing lines
                </p>
              ) : null}
            </>
          )}
        </div>

        {showBackToTop ? (
          <button
            type="button"
            onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
            className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-[0_8px_24px_rgba(var(--mli-ink-rgb),0.2)] lg:flex"
          >
            <IconArrowUp className="size-3.5" />
            Back to top
          </button>
        ) : null}
      </section>

      {isDesktop ? (
        <aside aria-label="Costing details" className="hidden min-h-0 min-w-0 overflow-hidden rounded-2xl surface lg:flex lg:flex-col">
          {activeId ? (
            <CostingPanel costingId={activeId} onDeleted={() => select(null)} className="h-full" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <IconCalculator className="size-7" />
              </span>
              <p className="font-medium text-foreground">No costing line selected</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Pick a line on the left to see its amounts and the vendor invoices matched to it.
              </p>
            </div>
          )}
        </aside>
      ) : (
        <Sheet open={Boolean(selectedParam)} onOpenChange={(open) => !open && select(null)}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-xl [&>button:last-child]:hidden">
            <SheetTitle className="sr-only">Costing details</SheetTitle>
            <SheetDescription className="sr-only">Amounts and matched vendor invoice lines</SheetDescription>
            {selectedParam ? (
              <CostingPanel
                costingId={selectedParam}
                onClose={() => select(null)}
                onDeleted={() => select(null)}
                className="h-full"
              />
            ) : null}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}

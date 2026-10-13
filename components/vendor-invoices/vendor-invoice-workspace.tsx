"use client"

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { IconArrowUp, IconReceipt, IconSearch, IconX } from "@tabler/icons-react"

import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { formatIdr, formatIdrCompact } from "@/components/dashboard/overview-card"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { VendorFilter } from "@/components/ui/vendor-filter"
import { VendorInvoicePanel } from "@/components/vendor-invoices/vendor-invoice-panel"
import { VendorInvoiceRow } from "@/components/vendor-invoices/vendor-invoice-row"
import { useIsDesktop } from "@/hooks/use-is-desktop"
import { useInfiniteVendorInvoices } from "@/hooks/use-vendor-invoices"
import { cn, vendorInvoiceInvoiceTotals } from "@/lib/utils"

const BATCH_SIZE = 30
const SEARCH_DELAY_MS = 300

type StatusFilter = "all" | "UNPAID" | "PAID"

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "PAID", label: "Paid" },
]

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
}

export function VendorInvoiceWorkspace({
  applied,
  onApply,
  enabled,
}: {
  applied: AppliedTableFilters
  onApply: (next: AppliedTableFilters) => void
  enabled: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isDesktop = useIsDesktop()

  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const searchTimer = useRef<number | undefined>(undefined)
  const itemRefs = useRef(new Map<string, HTMLButtonElement>())
  const [draftSearch, setDraftSearch] = useState(applied.search)
  const [showBackToTop, setShowBackToTop] = useState(false)

  const status = (["all", "UNPAID", "PAID"].includes(applied.status) ? applied.status : "all") as StatusFilter

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteVendorInvoices(
      {
        pageSize: BATCH_SIZE,
        search: applied.search || undefined,
        status,
        vendorId: applied.vendorId || undefined,
      },
      enabled
    )

  const invoices = data?.pages.flatMap((page) => page.items) ?? []
  const total = data?.pages[0]?.pagination.total ?? 0
  const loadedPayable = invoices.reduce(
    (sum, invoice) => sum + vendorInvoiceInvoiceTotals(invoice.vendorInvoiceBreakdowns ?? []).net,
    0
  )

  const selectedParam = searchParams.get("invoice")
  // On desktop the first invoice is shown by default so the panel is never empty.
  const activeId = selectedParam ?? (isDesktop ? invoices[0]?.id : undefined)

  const select = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (id) params.set("invoice", id)
      else params.delete("invoice")
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

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

  // Load the next batch as the end of the list scrolls into view.
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
  }, [fetchNextPage, hasNextPage, isDesktop, isFetchingNextPage, invoices.length])

  // "/" jumps to search from anywhere on the page.
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
    const index = invoices.findIndex((invoice) => invoice.id === activeId)
    const nextIndex = down ? Math.min(invoices.length - 1, index + 1) : Math.max(0, index - 1)
    if (down && nextIndex >= invoices.length - 3 && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
    const next = invoices[nextIndex]
    if (!next) return
    select(next.id)
    const node = itemRefs.current.get(next.id)
    node?.focus({ preventScroll: true })
    node?.scrollIntoView({ block: "nearest" })
  }

  const hasFilters = Boolean(applied.search) || status !== "all" || Boolean(applied.vendorId)

  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 lg:h-[calc(100svh-13.75rem)] lg:min-h-[560px] lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
      <section aria-label="Vendor invoice list" className="relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl surface">
        <div className="space-y-3 border-b border-border p-3">
          <label className="relative block">
            <span className="sr-only">Search vendor invoices</span>
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              value={draftSearch}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search invoice number or vendor…"
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

          <div className="flex flex-wrap items-center gap-2">
            <div role="radiogroup" aria-label="Payment status" className="flex gap-1">
              {STATUS_OPTIONS.map((option) => {
                const active = status === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => applyFilters({ status: option.value })}
                    className={cn(
                      "h-8 cursor-pointer rounded-full px-3.5 text-[13px] font-medium transition-colors",
                      active ? "brand-fill" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
            <div className="ml-auto [&>div]:h-8 [&_button]:h-8">
              <VendorFilter
                value={applied.vendorId}
                valueLabel={applied.vendorLabel}
                onChange={(next) => applyFilters({ vendorId: next.vendorId, vendorLabel: next.vendorLabel })}
              />
            </div>
          </div>

          <p className="flex items-center justify-between gap-2 text-xs text-muted-foreground" aria-live="polite">
            <span>
              {isLoading ? (
                "Loading…"
              ) : (
                <>
                  <span className="font-medium text-foreground tabular-nums">{invoices.length}</span> of{" "}
                  <span className="tabular-nums">{total.toLocaleString("id-ID")}</span> invoices
                </>
              )}
            </span>
            {!isLoading && invoices.length > 0 ? (
              <span title={`${formatIdr(loadedPayable)} across the invoices loaded so far`}>
                Payable <span className="font-medium text-foreground tabular-nums">{formatIdrCompact(loadedPayable)}</span>
                {hasNextPage ? "+" : ""}
              </span>
            ) : null}
          </p>
        </div>

        <div
          ref={scrollRef}
          role="list"
          aria-label="Vendor invoices"
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
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <IconReceipt className="size-6 text-muted-foreground" />
              </span>
              <p className="font-medium text-foreground">No vendor invoices found</p>
              {hasFilters ? (
                <button
                  type="button"
                  className="cursor-pointer text-sm font-medium text-primary hover:underline"
                  onClick={() => {
                    setDraftSearch("")
                    applyFilters({ search: "", status: "all", vendorId: undefined, vendorLabel: undefined })
                  }}
                >
                  Clear search and filters
                </button>
              ) : null}
            </div>
          ) : (
            <>
              {invoices.map((invoice) => (
                <div role="listitem" key={invoice.id}>
                  <VendorInvoiceRow
                    ref={(node) => {
                      if (node) itemRefs.current.set(invoice.id, node)
                      else itemRefs.current.delete(invoice.id)
                    }}
                    invoice={invoice}
                    selected={invoice.id === activeId}
                    onSelect={() => select(invoice.id)}
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
                  That&apos;s all {total.toLocaleString("id-ID")} invoices
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
        <aside aria-label="Vendor invoice details" className="hidden min-h-0 min-w-0 overflow-hidden rounded-2xl surface lg:flex lg:flex-col">
          {activeId ? (
            <VendorInvoicePanel vendorInvoiceId={activeId} onDeleted={() => select(null)} className="h-full" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <IconReceipt className="size-7" />
              </span>
              <p className="font-medium text-foreground">No invoice selected</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Pick an invoice on the left to see its lines, totals and documents here.
              </p>
            </div>
          )}
        </aside>
      ) : (
        <Sheet open={Boolean(selectedParam)} onOpenChange={(open) => !open && select(null)}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-xl [&>button:last-child]:hidden">
            <SheetTitle className="sr-only">Vendor invoice details</SheetTitle>
            <SheetDescription className="sr-only">Lines, totals and documents</SheetDescription>
            {selectedParam ? (
              <VendorInvoicePanel
                vendorInvoiceId={selectedParam}
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

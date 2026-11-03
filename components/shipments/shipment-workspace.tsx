"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  IconArrowUp,
  IconChevronDown,
  IconLayoutList,
  IconStack2,
  IconSearch,
  IconShip,
  IconTicket,
  IconX,
} from "@tabler/icons-react"

import { SHIPMENT_FILTER_PILLS } from "@/app/dashboard/shipments/column-filter-fields"
import { ColumnFilterBar } from "@/components/column-filter/column-filter"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import type { Shipment } from "@/app/dashboard/shipments/columns"
import { ShipmentCompactRow } from "@/components/shipments/shipment-compact-row"
import { ShipmentDetailPanel } from "@/components/shipments/shipment-detail-panel"
import { ShipmentExportButton } from "@/components/shipments/shipment-export-button"
import { ShipmentFilterProvider, shipmentFilterParams } from "@/components/shipments/shipment-filter-provider"
import { ShipmentTicketCard } from "@/components/shipments/shipment-ticket-card"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useIsDesktop } from "@/hooks/use-is-desktop"
import { usePersistedChoice } from "@/hooks/use-persisted-choice"
import { useInfiniteShipments } from "@/hooks/use-shipments"
import { SHIPMENT_LIFECYCLE_OPTIONS } from "@/lib/data-table-filters"
import { vesselLabel } from "@/lib/shipment-reference"
import { cn } from "@/lib/utils"

const BATCH_SIZE = 30
const SEARCH_DELAY_MS = 300

type Density = "compact" | "ticket"
type GroupBy = "none" | "customer" | "vessel"

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "none", label: "No grouping" },
  { value: "customer", label: "Customer" },
  { value: "vessel", label: "Vessel" },
]

type ShipmentGroup = { key: string; label: string; hint?: string; shipments: Shipment[] }

/** Buckets the loaded shipments; groups keep the order they first appear in. */
function groupShipments(shipments: Shipment[], groupBy: GroupBy): ShipmentGroup[] {
  if (groupBy === "none") return [{ key: "all", label: "", shipments }]
  const groups = new Map<string, ShipmentGroup>()
  for (const shipment of shipments) {
    let key: string
    let label: string
    let hint: string | undefined
    if (groupBy === "customer") {
      const customer = shipment.customerCode
      key = shipment.customerCodeId || "none"
      label = customer?.customerName?.trim() || "No customer"
      hint = customer?.customerCode
    } else {
      const vessel = vesselLabel(shipment.shipmentOperational?.vessel)
      key = vessel ?? "none"
      label = vessel ?? "No vessel"
    }
    const group = groups.get(key)
    if (group) group.shipments.push(shipment)
    else groups.set(key, { key, label, hint, shipments: [shipment] })
  }
  return [...groups.values()]
}

function GroupMenu({ value, onChange }: { value: GroupBy; onChange: (value: GroupBy) => void }) {
  const active = value !== "none"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Group shipments"
          title="Group shipments"
          className={cn(
            "flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
            active ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <IconStack2 className="size-4" />
          {active ? GROUP_OPTIONS.find((option) => option.value === value)?.label : "Group"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Group by</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={value} onValueChange={(next) => onChange(next as GroupBy)}>
          {GROUP_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
}

function DensityToggle({ value, onChange }: { value: Density; onChange: (value: Density) => void }) {
  const options = [
    { value: "compact" as const, label: "Compact list", icon: IconLayoutList },
    { value: "ticket" as const, label: "Ticket cards", icon: IconTicket },
  ]
  return (
    <div role="radiogroup" aria-label="Density" className="flex h-8 items-center rounded-full bg-muted p-0.5">
      {options.map(({ value: option, label, icon: Icon }) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          aria-label={label}
          title={label}
          onClick={() => onChange(option)}
          className={cn(
            "flex h-full w-8 cursor-pointer items-center justify-center rounded-full transition-colors",
            value === option ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  )
}

function ListSkeleton({ density }: { density: Density }) {
  return (
    <div className={density === "ticket" ? "space-y-3" : "space-y-1"}>
      {Array.from({ length: density === "ticket" ? 3 : 8 }).map((_, index) => (
        <Skeleton
          key={index}
          className={density === "ticket" ? "h-[300px] rounded-xl bg-card" : "h-[76px] rounded-lg"}
        />
      ))}
    </div>
  )
}

export function ShipmentWorkspace({
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
  const [density, setDensity] = usePersistedChoice<Density>(
    "mli:shipments:density",
    ["compact", "ticket"],
    "compact"
  )
  const [groupBy, setGroupBy] = usePersistedChoice<GroupBy>(
    "mli:shipments:group",
    ["none", "customer", "vessel"],
    "none"
  )
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())

  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const searchTimer = useRef<number | undefined>(undefined)
  const itemRefs = useRef(new Map<string, HTMLButtonElement>())
  const [draftSearch, setDraftSearch] = useState(applied.search)
  const [showBackToTop, setShowBackToTop] = useState(false)

  // The status tabs are a shortcut for the Status column filter: one ticked
  // status lights its tab, none lights "All", several light none.
  const statusFilter = applied.columns?.status ?? []
  const activeStatus = statusFilter.length === 0 ? "all" : statusFilter.length === 1 ? statusFilter[0].value : null

  // Grouping sorts by the grouped field first, so a group's shipments arrive
  // together as batches load instead of scattering across the list.
  const filterParams = shipmentFilterParams(applied)
  const groupSortDir = applied.sort?.by === groupBy ? applied.sort.dir : "asc"
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteShipments(
      {
        pageSize: BATCH_SIZE,
        ...filterParams,
        ...(groupBy !== "none" ? { sortBy: groupBy, sortDir: groupSortDir } : {}),
      },
      enabled
    )

  const loaded = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])
  const groups = useMemo(() => groupShipments(loaded, groupBy), [loaded, groupBy])
  // Shipments in list order, minus collapsed groups — what the arrow keys walk through.
  const shipments = useMemo(
    () => groups.flatMap((group) => (collapsed.has(group.key) ? [] : group.shipments)),
    [groups, collapsed]
  )
  const total = data?.pages[0]?.pagination.total ?? 0

  const selectedParam = searchParams.get("shipment")
  // On desktop the first shipment is shown by default so the panel is never empty.
  const activeId = selectedParam ?? (isDesktop ? shipments[0]?.id : undefined)

  const select = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (id) params.set("shipment", id)
      else params.delete("shipment")
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
    searchTimer.current = window.setTimeout(
      () => applyFilters({ search: value.trim() }),
      SEARCH_DELAY_MS
    )
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
  }, [fetchNextPage, hasNextPage, isDesktop, isFetchingNextPage, shipments.length])

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
    const index = shipments.findIndex((shipment) => shipment.id === activeId)
    const nextIndex = down ? Math.min(shipments.length - 1, index + 1) : Math.max(0, index - 1)
    if (down && nextIndex >= shipments.length - 3 && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
    const next = shipments[nextIndex]
    if (!next?.id) return
    select(next.id)
    const node = itemRefs.current.get(next.id)
    node?.focus({ preventScroll: true })
    node?.scrollIntoView({ block: "nearest" })
  }

  const setItemRef = (id: string | undefined) => (node: HTMLButtonElement | null) => {
    if (!id) return
    if (node) itemRefs.current.set(id, node)
    else itemRefs.current.delete(id)
  }

  const hasFilters =
    Boolean(applied.search) ||
    Boolean(applied.sort) ||
    Object.values(applied.columns ?? {}).some((entries) => entries.length)

  const changeGroupBy = (next: GroupBy) => {
    setGroupBy(next)
    setCollapsed(new Set())
    scrollRef.current?.scrollTo({ top: 0 })
  }

  const toggleGroup = (key: string) =>
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const setStatusTab = (value: string, label: string) => {
    const columns = { ...(applied.columns ?? {}) }
    if (value === "all") delete columns.status
    else columns.status = [{ value, label }]
    applyFilters({ columns })
  }

  return (
    <ShipmentFilterProvider
      applied={applied}
      onChange={({ columns, sort }) => applyFilters({ columns, sort })}
    >
    <div className="grid min-w-0 grid-cols-1 gap-5 lg:h-[calc(100svh-13.75rem)] lg:min-h-[560px] lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
      {/* List pane */}
      <section
        aria-label="Shipment list"
        className="relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl surface"
      >
        <div className="space-y-3 border-b border-border p-3">
          <label className="relative block">
            <span className="sr-only">Search shipments</span>
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              value={draftSearch}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search customer, vessel, booking or BL…"
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

          <div
            role="radiogroup"
            aria-label="Status"
            className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1"
          >
            {SHIPMENT_LIFECYCLE_OPTIONS.map((option) => {
              const active = activeStatus === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setStatusTab(option.value, option.label)}
                  className={cn(
                    "h-8 shrink-0 cursor-pointer rounded-full px-3.5 text-[13px] font-medium transition-colors",
                    active
                      ? "brand-fill"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>

          {/* Fades at the right edge so it reads as scrollable; the padding lets the last pill clear the fade. */}
          <ColumnFilterBar
            items={SHIPMENT_FILTER_PILLS}
            className="-mx-1 px-1 pr-10 [mask-image:linear-gradient(to_right,#000_calc(100%-2.5rem),transparent)]"
          />

          <div className="flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground" aria-live="polite">
              {isLoading ? (
                "Loading…"
              ) : (
                <>
                  <span className="font-medium text-foreground tabular-nums">{loaded.length}</span>
                  {" of "}
                  <span className="tabular-nums">{total.toLocaleString("id-ID")}</span> shipments
                </>
              )}
            </p>
            <GroupMenu value={groupBy} onChange={changeGroupBy} />
            <DensityToggle value={density} onChange={setDensity} />
            <ShipmentExportButton applied={applied} totalRows={total} compact />
          </div>
        </div>

        <div
          ref={scrollRef}
          role="list"
          aria-label="Shipments"
          aria-busy={isLoading || isFetchingNextPage}
          onKeyDown={onListKeyDown}
          onScroll={(event) => setShowBackToTop(event.currentTarget.scrollTop > 600)}
          className={cn(
            "min-h-0 flex-1 p-2 lg:overflow-y-auto",
            density === "ticket" && "space-y-3 bg-background p-3"
          )}
        >
          {isLoading ? (
            <ListSkeleton density={density} />
          ) : error ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">{error.message}</p>
          ) : loaded.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <IconShip className="size-6 text-muted-foreground" />
              </span>
              <p className="font-medium text-foreground">No shipments found</p>
              {hasFilters ? (
                <button
                  type="button"
                  className="cursor-pointer text-sm font-medium text-primary hover:underline"
                  onClick={() => {
                    setDraftSearch("")
                    applyFilters({ search: "", columns: {}, sort: undefined })
                  }}
                >
                  Clear search and filters
                </button>
              ) : null}
            </div>
          ) : (
            <>
              {groups.map((group) => {
                const isCollapsed = collapsed.has(group.key)
                const items = group.shipments.map((shipment) => (
                  <div role="listitem" key={shipment.id}>
                    {density === "ticket" ? (
                      <ShipmentTicketCard
                        ref={setItemRef(shipment.id)}
                        shipment={shipment}
                        selected={shipment.id === activeId}
                        onSelect={() => shipment.id && select(shipment.id)}
                      />
                    ) : (
                      <ShipmentCompactRow
                        ref={setItemRef(shipment.id)}
                        shipment={shipment}
                        selected={shipment.id === activeId}
                        groupBy={groupBy === "none" ? null : groupBy}
                        onSelect={() => shipment.id && select(shipment.id)}
                      />
                    )}
                  </div>
                ))
                if (groupBy === "none") return items
                return (
                  <div key={group.key} role="group" aria-label={group.label}>
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.key)}
                      aria-expanded={!isCollapsed}
                      className={cn(
                        "sticky top-0 z-10 flex w-full cursor-pointer items-center gap-2 rounded-lg bg-card/95 px-3 py-2 text-left backdrop-blur",
                        density === "ticket" && "mb-2 bg-background/95"
                      )}
                    >
                      <IconChevronDown
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform",
                          isCollapsed && "-rotate-90"
                        )}
                      />
                      {group.hint ? (
                        <span
                          className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[11px] font-semibold text-secondary-foreground"
                          title={group.label}
                        >
                          {group.hint}
                        </span>
                      ) : null}
                      <span className="min-w-0 truncate text-xs font-semibold text-foreground" title={group.label}>
                        {group.label}
                      </span>
                      <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">
                        {group.shipments.length}
                        {hasNextPage && group === groups[groups.length - 1] ? "+" : ""}
                      </span>
                    </button>
                    {isCollapsed ? null : (
                      <div className={density === "ticket" ? "space-y-3" : undefined}>{items}</div>
                    )}
                  </div>
                )
              })}
              <div ref={sentinelRef} aria-hidden className="h-px" />
              {isFetchingNextPage ? (
                <div className="pt-2">
                  <ListSkeleton density={density} />
                </div>
              ) : !hasNextPage ? (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  That&apos;s all {total.toLocaleString("id-ID")} shipments
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

      {/* Detail panel (desktop) */}
      {isDesktop ? (
        <aside
          aria-label="Shipment details"
          className="hidden min-h-0 min-w-0 overflow-hidden rounded-2xl surface lg:flex lg:flex-col"
        >
          {activeId ? (
            <ShipmentDetailPanel shipmentId={activeId} onDeleted={() => select(null)} className="h-full" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <IconTicket className="size-7" />
              </span>
              <p className="font-medium text-foreground">No shipment selected</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Pick a shipment on the left to see its route, containers, documents and invoices here.
              </p>
            </div>
          )}
        </aside>
      ) : (
        <Sheet open={Boolean(selectedParam)} onOpenChange={(open) => !open && select(null)}>
          <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-xl [&>button:last-child]:hidden">
            <SheetTitle className="sr-only">Shipment details</SheetTitle>
            <SheetDescription className="sr-only">Route, containers, documents and invoices</SheetDescription>
            {selectedParam ? (
              <ShipmentDetailPanel
                shipmentId={selectedParam}
                onClose={() => select(null)}
                onDeleted={() => select(null)}
                className="h-full"
              />
            ) : null}
          </SheetContent>
        </Sheet>
      )}
    </div>
    </ShipmentFilterProvider>
  )
}

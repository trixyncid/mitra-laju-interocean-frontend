"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { IconArrowDown, IconArrowUp, IconFilter, IconFilterFilled, IconX } from "@tabler/icons-react"

import { ColumnFilterMenu } from "@/components/column-filter/column-filter-menu"
import type { ColumnFilterField, ColumnSort, FacetValue, FilterEntry } from "@/components/column-filter/types"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

type ColumnFilterState = {
  columns: Record<string, FilterEntry[]>
  sort?: ColumnSort
  fields: Record<string, ColumnFilterField>
  /** Sort names shown in the sorted-by chip, keyed by sort key. */
  sortLabels: Record<string, string>
  setColumn: (field: string, entries: FilterEntry[] | null) => void
  setSort: (sort: ColumnSort | undefined) => void
  clearAll: () => void
  facetKey: readonly unknown[]
  fetchFacets: (field: string) => Promise<FacetValue[]>
}

const ColumnFilterContext = createContext<ColumnFilterState | null>(null)

/**
 * Gives column headers in a table the Excel-style filter menus. The page
 * owns the state (columns + sort) and tells the provider how to load values.
 */
export function ColumnFilterProvider({
  columns,
  sort,
  fields,
  sortLabels = {},
  onChange,
  facetKey,
  fetchFacets,
  children,
}: {
  columns: Record<string, FilterEntry[]> | undefined
  sort: ColumnSort | undefined
  fields: Record<string, ColumnFilterField>
  sortLabels?: Record<string, string>
  onChange: (next: { columns: Record<string, FilterEntry[]>; sort: ColumnSort | undefined }) => void
  /** React Query key for the current filters; a field name is appended. */
  facetKey: readonly unknown[]
  fetchFacets: (field: string) => Promise<FacetValue[]>
  children: ReactNode
}) {
  const current = columns ?? {}
  const state: ColumnFilterState = {
    columns: current,
    sort,
    fields,
    sortLabels,
    facetKey,
    fetchFacets,
    setColumn: (field, entries) => {
      const next = { ...current }
      if (entries && entries.length) next[field] = entries
      else delete next[field]
      onChange({ columns: next, sort })
    },
    setSort: (nextSort) => onChange({ columns: current, sort: nextSort }),
    clearAll: () => onChange({ columns: {}, sort: undefined }),
  }
  return <ColumnFilterContext.Provider value={state}>{children}</ColumnFilterContext.Provider>
}

/**
 * A column header with Excel's filter button. Outside a provider it is just
 * the label, so shared column definitions still render elsewhere.
 */
export function ColumnFilterHeader({
  field,
  label,
  sortKey,
  appearance = "header",
  className,
}: {
  /** Filter field; omit for a sort-only header. */
  field?: string
  label: string
  sortKey?: string
  /** "pill" is the stand-alone button used above card lists, which have no headers. */
  appearance?: "header" | "pill"
  className?: string
}) {
  const ctx = useContext(ColumnFilterContext)
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()
  const config = field ? ctx?.fields[field] : undefined

  const facets = useQuery({
    queryKey: [...(ctx?.facetKey ?? []), "facets", field],
    queryFn: () => ctx!.fetchFacets(field!),
    enabled: open && Boolean(ctx && field),
    staleTime: 30_000,
  })

  if (!ctx || (!config && !sortKey)) return <span>{label}</span>

  const selected = field ? ctx.columns[field] : undefined
  const sortDir = sortKey && ctx.sort?.by === sortKey ? ctx.sort.dir : null
  const filtered = Boolean(selected?.length)
  const title = config?.label ?? label

  const menu = (
    <ColumnFilterMenu
      key={open ? "open" : "closed"}
      title={title}
      kind={config?.kind ?? "list"}
      facets={field ? facets.data : []}
      loading={Boolean(field) && facets.isLoading}
      error={facets.isError}
      selected={selected}
      sort={
        sortKey
          ? {
              active: sortDir,
              onSort: (dir) => {
                ctx.setSort(sortDir === dir ? undefined : { by: sortKey, dir })
                setOpen(false)
              },
            }
          : undefined
      }
      onApply={(entries) => {
        if (field) ctx.setColumn(field, entries)
        setOpen(false)
      }}
      onCancel={() => setOpen(false)}
    />
  )

  const trigger = (
    <button
      type="button"
      onClick={isMobile ? () => setOpen(true) : undefined}
      aria-label={`Filter and sort ${title}${filtered ? " (filtered)" : ""}`}
      title={filtered ? `${title}: ${selected!.map((entry) => entry.label).join(", ")}` : undefined}
      aria-haspopup="dialog"
      className={cn(
        appearance === "pill"
          ? "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20"
          : "-mx-2 inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 font-medium whitespace-nowrap transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20",
        appearance === "pill" &&
          (filtered || sortDir
            ? "border-primary/40 bg-secondary text-primary"
            : "border-border bg-card text-muted-foreground hover:border-input hover:text-foreground"),
        appearance === "header" && (filtered || sortDir) && "text-primary",
        className
      )}
    >
      {label}
      {appearance === "pill" && filtered ? (
        <span className="rounded-full bg-primary px-1.5 text-[11px] leading-[18px] text-primary-foreground tabular-nums">
          {selected!.length}
        </span>
      ) : null}
      {sortDir === "asc" ? <IconArrowUp className="size-3.5" aria-hidden /> : null}
      {sortDir === "desc" ? <IconArrowDown className="size-3.5" aria-hidden /> : null}
      {config ? (
        filtered ? (
          <IconFilterFilled className="size-3.5" aria-hidden />
        ) : (
          <IconFilter className="size-3.5 opacity-60" aria-hidden />
        )
      ) : null}
    </button>
  )

  if (isMobile) {
    return (
      <>
        {trigger}
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[88svh]">
            <DrawerTitle className="sr-only">Filter {title}</DrawerTitle>
            {menu}
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" side="bottom" avoidCollisions={false} collisionPadding={12} className="w-[300px] p-0">
        {menu}
      </PopoverContent>
    </Popover>
  )
}

function chipText(entries: FilterEntry[]) {
  const names = entries.map((entry) => entry.label)
  return names.length <= 2 ? names.join(", ") : `${names.slice(0, 2).join(", ")} +${names.length - 2}`
}

/** What is filtered and sorted right now, each removable, plus "Clear all". */
export function ActiveColumnFilters({ className }: { className?: string }) {
  const ctx = useContext(ColumnFilterContext)
  if (!ctx) return null
  const active = Object.entries(ctx.columns).filter(([field, entries]) => entries.length && ctx.fields[field])
  if (!active.length && !ctx.sort) return null

  return (
    <div className={cn("flex flex-wrap items-center gap-2 pb-4", className)} aria-label="Active filters">
      {active.map(([field, entries]) => (
        <span
          key={field}
          className="inline-flex max-w-full items-center gap-1 rounded-full bg-secondary py-1 pr-1 pl-3 text-xs text-secondary-foreground"
          title={entries.map((entry) => entry.label).join(", ")}
        >
          <span className="font-medium">{ctx.fields[field].label}:</span>
          <span className="truncate">{chipText(entries)}</span>
          <button
            type="button"
            onClick={() => ctx.setColumn(field, null)}
            aria-label={`Remove ${ctx.fields[field].label} filter`}
            className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-primary/15"
          >
            <IconX className="size-3.5" />
          </button>
        </span>
      ))}
      {ctx.sort ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted py-1 pr-1 pl-3 text-xs text-foreground">
          Sorted by <span className="font-medium">{ctx.sortLabels[ctx.sort.by] ?? ctx.sort.by}</span>
          {ctx.sort.dir === "asc" ? <IconArrowUp className="size-3.5" /> : <IconArrowDown className="size-3.5" />}
          <button
            type="button"
            onClick={() => ctx.setSort(undefined)}
            aria-label="Remove sort"
            className="flex size-5 cursor-pointer items-center justify-center rounded-full hover:bg-foreground/10"
          >
            <IconX className="size-3.5" />
          </button>
        </span>
      ) : null}
      <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={ctx.clearAll}>
        Clear all
      </Button>
    </div>
  )
}

/**
 * Excel-style filters for lists without column headers (card lists): one
 * pill per field, each opening the same menu as a table header.
 */
export function ColumnFilterBar({
  items,
  className,
}: {
  items: { field?: string; sortKey?: string; label: string }[]
  className?: string
}) {
  const ctx = useContext(ColumnFilterContext)
  if (!ctx) return null
  const anything = Object.values(ctx.columns).some((entries) => entries.length) || Boolean(ctx.sort)
  return (
    <div
      role="group"
      aria-label="Filter and sort"
      className={cn("flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]", className)}
    >
      <IconFilter className="mr-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      {items.map((item) => (
        <ColumnFilterHeader
          key={item.field ?? item.sortKey ?? item.label}
          field={item.field}
          sortKey={item.sortKey}
          label={item.label}
          appearance="pill"
        />
      ))}
      {anything ? (
        <Button type="button" variant="ghost" size="sm" className="h-8 shrink-0 px-2 text-xs" onClick={ctx.clearAll}>
          Clear all
        </Button>
      ) : null}
    </div>
  )
}

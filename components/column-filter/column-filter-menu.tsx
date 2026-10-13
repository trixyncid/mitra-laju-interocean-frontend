"use client"

import { useMemo, useState, type ReactNode } from "react"
import {
  IconCheck,
  IconChevronRight,
  IconMinus,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react"

import { buildDateTree, compactDays, dateTokenLabel, tokenCovers } from "@/components/column-filter/date-tokens"
import { BLANK, type ColumnFilterKind, type FacetValue, type FilterEntry } from "@/components/column-filter/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Tick = "all" | "some" | "none"

function tickOf(values: string[], checked: Set<string>): Tick {
  const on = values.filter((value) => checked.has(value)).length
  return on === 0 ? "none" : on === values.length ? "all" : "some"
}

/** The box itself; rows carry role="checkbox" so the whole row is the target. */
function TickBox({ tick }: { tick: Tick }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors",
        tick === "none" ? "border-input bg-card" : "border-primary bg-primary text-primary-foreground"
      )}
    >
      {tick === "all" ? <IconCheck className="size-3" stroke={3} /> : null}
      {tick === "some" ? <IconMinus className="size-3" stroke={3} /> : null}
    </span>
  )
}

function TickRow({
  tick,
  label,
  count,
  onToggle,
  depth = 0,
  lead,
  strong,
}: {
  tick: Tick
  label: ReactNode
  count?: number
  onToggle: () => void
  depth?: number
  lead?: ReactNode
  strong?: boolean
}) {
  return (
    <div className="flex items-center" style={{ paddingLeft: depth * 20 }}>
      {lead ?? (depth > 0 ? <span className="w-6 shrink-0" /> : null)}
      <button
        type="button"
        role="checkbox"
        aria-checked={tick === "all" ? true : tick === "some" ? "mixed" : false}
        onClick={onToggle}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
      >
        <TickBox tick={tick} />
        <span className={cn("min-w-0 flex-1 truncate", strong ? "font-medium text-foreground" : "text-foreground")}>{label}</span>
        {count !== undefined ? (
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{count.toLocaleString("en-US")}</span>
        ) : null}
      </button>
    </div>
  )
}

function ExpandButton({ open, label, onClick }: { open: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-label={`${open ? "Collapse" : "Expand"} ${label}`}
      onClick={onClick}
      className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <IconChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
    </button>
  )
}

export type ColumnFilterMenuProps = {
  title: string
  kind: ColumnFilterKind
  facets: FacetValue[] | undefined
  loading: boolean
  error: boolean
  /** Current filter; undefined means nothing is filtered (every value shows). */
  selected: FilterEntry[] | undefined
  /** Sort on this column, when it can be sorted. */
  sort?: { active: "asc" | "desc" | null; onSort: (dir: "asc" | "desc") => void }
  onApply: (entries: FilterEntry[] | null) => void
  onCancel: () => void
}

/**
 * Excel's column filter: sort, search, (Select all) and a tick per value with
 * its row count. Dates tick by Year ▸ Month ▸ Day. Apply sends the ticks.
 */
export function ColumnFilterMenu({ title, kind, facets, loading, error, selected, sort, onApply, onCancel }: ColumnFilterMenuProps) {
  const [search, setSearch] = useState("")
  /** Null until the user ticks something; until then ticks follow `selected`. */
  const [draft, setDraft] = useState<Set<string> | null>(null)
  /** Expand/collapse choices; rows without one use their default (newest year open). */
  const [expanded, setExpanded] = useState<Map<string, boolean>>(() => new Map())

  const values = useMemo(() => facets ?? [], [facets])
  const allValues = useMemo(() => values.map((facet) => facet.value), [values])

  // Ticked values that no row has right now (other filters hide them): still listed so they can be unticked.
  const orphans = useMemo(() => {
    if (!selected) return []
    return selected.filter((entry) => !allValues.some((value) => tokenCovers(entry.value, value)))
  }, [selected, allValues])

  const initial = useMemo(() => {
    if (!selected) return new Set(allValues)
    const set = new Set<string>()
    for (const value of allValues) if (selected.some((entry) => tokenCovers(entry.value, value))) set.add(value)
    for (const orphan of orphans) set.add(orphan.value)
    return set
  }, [selected, allValues, orphans])

  const checked = draft ?? initial
  const query = search.trim().toLowerCase()

  const visible = useMemo(() => {
    if (!query) return values
    return values.filter((facet) => {
      const label = kind === "date" ? dateTokenLabel(facet.value) : facet.label
      return label.toLowerCase().includes(query)
    })
  }, [values, query, kind])
  const visibleValues = [...visible.map((facet) => facet.value), ...(query ? [] : orphans.map((orphan) => orphan.value))]

  const tree = useMemo(() => (kind === "date" ? buildDateTree(visible) : []), [kind, visible])
  const fullTree = useMemo(() => (kind === "date" ? buildDateTree(values) : []), [kind, values])
  const blank = visible.find((facet) => facet.value === BLANK)
  const isOpen = (key: string, fallback: boolean) => (query ? true : (expanded.get(key) ?? fallback))
  const toggleExpand = (key: string, fallback: boolean) =>
    setExpanded((prev) => new Map(prev).set(key, !(prev.get(key) ?? fallback)))

  const setMany = (keys: string[], on: boolean) => {
    const next = new Set(checked)
    for (const key of keys) {
      if (on) next.add(key)
      else next.delete(key)
    }
    setDraft(next)
  }

  const selectAllTick = tickOf(visibleValues, checked)
  const nothingTicked = checked.size === 0
  const everythingTicked = allValues.every((value) => checked.has(value)) && orphans.every((orphan) => checked.has(orphan.value))

  const apply = () => {
    if (everythingTicked && !orphans.length) return onApply(null)
    if (kind === "date") {
      const days = new Set([...checked].filter((value) => allValues.includes(value)))
      const tokens = compactDays(days, fullTree)
      const kept = orphans.filter((orphan) => checked.has(orphan.value))
      return onApply([
        ...tokens.map((token) => ({ value: token, label: dateTokenLabel(token) })),
        ...kept,
      ])
    }
    const labels = new Map([...values.map((facet) => [facet.value, facet.label] as const), ...orphans.map((o) => [o.value, o.label] as const)])
    return onApply([...checked].map((value) => ({ value, label: labels.get(value) ?? value })))
  }

  const sortLabels = kind === "date" ? ["Oldest first", "Newest first"] : ["Sort A → Z", "Sort Z → A"]

  return (
    <div className="flex max-h-[min(80svh,560px,var(--radix-popover-content-available-height,560px))] w-full flex-col">
      <p className="px-3 pt-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</p>

      {sort ? (
        <div className="mt-1 px-1.5">
          {(["asc", "desc"] as const).map((dir, index) => (
            <button
              key={dir}
              type="button"
              onClick={() => sort.onSort(dir)}
              aria-pressed={sort.active === dir}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
                sort.active === dir ? "font-medium text-primary" : "text-foreground"
              )}
            >
              {dir === "asc" ? <IconSortAscending className="size-4" /> : <IconSortDescending className="size-4" />}
              <span className="flex-1">{sortLabels[index]}</span>
              {sort.active === dir ? <IconCheck className="size-4" /> : null}
            </button>
          ))}
          <div className="mx-2 my-1.5 h-px bg-border" />
        </div>
      ) : null}

      <div className="px-3 pt-1.5">
        <label className="relative block">
          <span className="sr-only">Search {title}</span>
          <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${title}`}
            className="h-9 w-full rounded-full border border-border bg-card pr-3 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-input focus:ring-[3px] focus:ring-ring/10"
          />
        </label>
      </div>

      <div className="mt-2 min-h-24 flex-1 overflow-y-auto px-1.5 pb-1" role="group" aria-label={`${title} values`}>
        {loading && !values.length ? (
          <div className="space-y-2 px-2 py-2" aria-label="Loading">
            {[0, 1, 2, 3].map((key) => (
              <div key={key} className="h-5 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : error ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">Could not load the values. Close and try again.</p>
        ) : visibleValues.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            {query ? `Nothing matches “${search.trim()}”.` : "No values to filter."}
          </p>
        ) : (
          <>
            <TickRow
              tick={selectAllTick}
              label={query ? "(Select all search results)" : "(Select all)"}
              strong
              onToggle={() => setMany(visibleValues, selectAllTick !== "all")}
            />
            {kind === "date" ? (
              <>
                {tree.map((year, yearIndex) => {
                  const yearDays = year.months.flatMap((month) => month.days.map((day) => day.value))
                  const yearOpen = isOpen(year.key, yearIndex === 0)
                  return (
                    <div key={year.key}>
                      <TickRow
                        tick={tickOf(yearDays, checked)}
                        label={year.label}
                        count={year.count}
                        lead={<ExpandButton open={yearOpen} label={year.label} onClick={() => toggleExpand(year.key, yearIndex === 0)} />}
                        onToggle={() => setMany(yearDays, tickOf(yearDays, checked) !== "all")}
                      />
                      {yearOpen
                        ? year.months.map((month) => {
                            const monthDays = month.days.map((day) => day.value)
                            const monthOpen = isOpen(month.key, false)
                            return (
                              <div key={month.key}>
                                <TickRow
                                  depth={1}
                                  tick={tickOf(monthDays, checked)}
                                  label={month.label}
                                  count={month.count}
                                  lead={<ExpandButton open={monthOpen} label={`${month.label} ${year.label}`} onClick={() => toggleExpand(month.key, false)} />}
                                  onToggle={() => setMany(monthDays, tickOf(monthDays, checked) !== "all")}
                                />
                                {monthOpen
                                  ? month.days.map((day) => (
                                      <TickRow
                                        key={day.value}
                                        depth={2}
                                        tick={checked.has(day.value) ? "all" : "none"}
                                        label={day.label}
                                        count={day.count}
                                        onToggle={() => setMany([day.value], !checked.has(day.value))}
                                      />
                                    ))
                                  : null}
                              </div>
                            )
                          })
                        : null}
                    </div>
                  )
                })}
                {blank ? (
                  <TickRow
                    tick={checked.has(BLANK) ? "all" : "none"}
                    label="(Blanks)"
                    count={blank.count}
                    lead={<span className="w-6 shrink-0" />}
                    onToggle={() => setMany([BLANK], !checked.has(BLANK))}
                  />
                ) : null}
              </>
            ) : (
              visible.map((facet) => (
                <TickRow
                  key={facet.value}
                  tick={checked.has(facet.value) ? "all" : "none"}
                  label={facet.label}
                  count={facet.count}
                  onToggle={() => setMany([facet.value], !checked.has(facet.value))}
                />
              ))
            )}
            {!query && orphans.length ? (
              <div className="mt-1 border-t border-border pt-1">
                <p className="px-2 py-1 text-[11px] text-muted-foreground">Ticked, but no rows right now</p>
                {orphans.map((orphan) => (
                  <TickRow
                    key={orphan.value}
                    tick={checked.has(orphan.value) ? "all" : "none"}
                    label={orphan.label}
                    count={0}
                    onToggle={() => setMany([orphan.value], !checked.has(orphan.value))}
                  />
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border p-2.5">
        <Button type="button" variant="ghost" size="sm" disabled={!selected} onClick={() => onApply(null)}>
          Clear filter
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" size="sm" disabled={nothingTicked || loading || error} onClick={apply} title={nothingTicked ? "Tick at least one value" : undefined}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}

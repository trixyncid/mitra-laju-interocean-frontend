"use client"

import { useMemo, type ComponentType } from "react"
import {
  IconBox,
  IconBoxAlignTop,
  IconCylinder,
  IconDimensions,
  IconLayoutBottombar,
  IconPackage,
  IconSnowflake,
  type IconProps,
} from "@tabler/icons-react"

import ContainerLookupActionCell from "@/components/action-cell/container-lookup-action-cell"
import ContainerLookupForm from "@/components/forms/container-lookup-form"
import type { ContainerLookup } from "@/app/dashboard/containers/columns"
import { DataTableToolbar } from "@/components/data-table-toolbar"
import ErrorPage from "@/components/error-page"
import { PermissionGate } from "@/components/permission-gate"
import { ReferenceEmpty } from "@/components/reference/reference-empty"
import { ReferencePager } from "@/components/reference/reference-pager"
import { Skeleton } from "@/components/ui/skeleton"
import { useContainerLookups } from "@/hooks/use-container-lookups"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
import { ACTIVE_STATUS_OPTIONS, type TableFilterConfig } from "@/lib/data-table-filters"
import { cn } from "@/lib/utils"
import type { ContainerLookupKind } from "@/services/container-lookups.service"

const lookupFilters: TableFilterConfig<ContainerLookup> = {
  status: {
    id: "isActive",
    label: "Status",
    options: ACTIVE_STATUS_OPTIONS,
    getValue: (row) => row.isActive,
  },
  date: {
    id: "updatedAt",
    label: "Changed",
    getValue: (row) => row.updatedAt,
  },
}

/* ---------- Sizes ---------- */

type SizeInfo = { feet: number | null; highCube: boolean }

function readSize(name: string): SizeInfo {
  const feet = Number(name.match(/\d+/)?.[0])
  return {
    feet: Number.isFinite(feet) && feet > 0 ? feet : null,
    highCube: /HC|HQ|HIGH/i.test(name),
  }
}

/** A side view of the box: its length follows the size, high cubes stand taller. */
function ContainerSilhouette({ info, active }: { info: SizeInfo; active: boolean }) {
  const width = info.feet ? Math.min(100, Math.max(30, (info.feet / 45) * 100)) : 60
  return (
    <div aria-hidden className="flex h-14 items-end">
      <div
        className={cn(
          "relative overflow-hidden rounded-[3px] shadow-sm",
          info.highCube ? "h-12" : "h-10",
          active ? "brand-fill" : "bg-muted-foreground/30"
        )}
        style={{ width: `${width}%` }}
      >
        {/* Corrugated walls */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.55) 0 1.5px, transparent 1.5px 7px)",
          }}
        />
        {/* Top and bottom rails */}
        <div className="absolute inset-x-0 top-0 h-1 bg-black/15" />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20" />
        {/* Doors */}
        <div className="absolute inset-y-1 right-1 flex gap-0.5">
          <span className="w-1 rounded-full bg-white/50" />
          <span className="w-1 rounded-full bg-white/50" />
        </div>
      </div>
    </div>
  )
}

function SizeTile({ item }: { item: ContainerLookup }) {
  const info = readSize(item.name)
  const teu = info.feet ? (info.feet <= 20 ? 1 : 2) : null
  return (
    <li
      className={cn(
        "group flex flex-col gap-3 rounded-xl p-4",
        item.isActive ? "surface surface-lift" : "border border-dashed border-border bg-muted/40"
      )}
    >
      <ContainerSilhouette info={info} active={item.isActive} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-baseline gap-1.5">
            <span className={cn("text-2xl font-semibold tracking-tight", item.isActive ? "text-foreground" : "text-muted-foreground")}>
              {item.name}
            </span>
            {info.feet ? <span className="text-xs text-muted-foreground">ft</span> : null}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {[info.highCube ? "High cube (taller)" : info.feet ? "Standard height" : "Size code", teu ? `${teu} TEU` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {!item.isActive ? <p className="mt-1 text-xs font-medium text-[var(--mli-on-error-container)]">Not in use</p> : null}
        </div>
        <div className="shrink-0 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 [@media(hover:none)]:opacity-100">
          <ContainerLookupActionCell kind="size" row={{ original: item }} />
        </div>
      </div>
    </li>
  )
}

/* ---------- Types ---------- */

type TypeInfo = { icon: ComponentType<IconProps>; name: string; hint: string; tone: string }

const TYPE_INFO: { match: RegExp; info: TypeInfo }[] = [
  { match: /^(DRY|DV|GP|DC)$/i, info: { icon: IconBox, name: "Dry", hint: "Normal goods, no cooling", tone: "bg-secondary text-primary" } },
  { match: /^(RF|RH|RE|REEFER)$/i, info: { icon: IconSnowflake, name: "Reefer", hint: "Keeps goods cold", tone: "bg-[var(--mli-import-container)] text-[var(--mli-on-import-container)]" } },
  { match: /^(OT|OPEN ?TOP)$/i, info: { icon: IconBoxAlignTop, name: "Open top", hint: "No roof, load from above", tone: "bg-[var(--mli-warning-container)] text-[var(--mli-on-warning-container)]" } },
  { match: /^(FR|FLAT ?RACK)$/i, info: { icon: IconLayoutBottombar, name: "Flat rack", hint: "No roof or walls, for big cargo", tone: "bg-[var(--mli-export-container)] text-[var(--mli-on-export-container)]" } },
  { match: /^(TK|TANK)$/i, info: { icon: IconCylinder, name: "Tank", hint: "For liquids", tone: "bg-[var(--mli-domestic-container)] text-[var(--mli-on-domestic-container)]" } },
]

function readType(code: string): TypeInfo {
  return (
    TYPE_INFO.find(({ match }) => match.test(code.trim()))?.info ?? {
      icon: IconPackage,
      name: "Container type",
      hint: "Custom type code",
      tone: "bg-muted text-muted-foreground",
    }
  )
}

function TypeTile({ item }: { item: ContainerLookup }) {
  const info = readType(item.name)
  const Icon = info.icon
  return (
    <li
      className={cn(
        "group flex items-center gap-3 rounded-xl p-3.5",
        item.isActive ? "surface surface-lift" : "border border-dashed border-border bg-muted/40"
      )}
    >
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-xl",
          item.isActive ? info.tone : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className={cn("font-mono text-lg font-semibold", item.isActive ? "text-foreground" : "text-muted-foreground")}>
            {item.name}
          </span>
          <span className="text-sm text-foreground/80">{info.name}</span>
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {item.isActive ? info.hint : "Not in use"}
        </p>
      </div>
      <div className="shrink-0 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 [@media(hover:none)]:opacity-100">
        <ContainerLookupActionCell kind="type" row={{ original: item }} />
      </div>
    </li>
  )
}

/* ---------- Panel ---------- */

const PANEL = {
  size: {
    title: "Sizes",
    description: "How long the container is. Taller boxes are high cube.",
    icon: IconDimensions,
    noun: "sizes",
  },
  type: {
    title: "Types",
    description: "What the container is built for.",
    icon: IconBox,
    noun: "types",
  },
} as const

export function EquipmentPanel({ kind }: { kind: ContainerLookupKind }) {
  const { applied, page, pageSize, setApplied, setPage, setPageSize, isRestored } =
    usePersistedTableState(`containers.${kind}`)
  const params = useMemo(
    () => ({
      page,
      pageSize,
      search: applied.search || undefined,
      status: applied.status as "all" | "true" | "false",
      from: applied.dateRange.from,
      to: applied.dateRange.to,
    }),
    [page, pageSize, applied]
  )
  const { data, isLoading, error } = useContainerLookups(kind, params, isRestored)
  const items = data?.items ?? []
  const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }
  const panel = PANEL[kind]
  const PanelIcon = panel.icon

  if (error) return <ErrorPage />

  // Shortest box first so the sizes read like a lineup.
  const sorted =
    kind === "size"
      ? [...items].sort(
          (a, b) =>
            (readSize(a.name).feet ?? 999) - (readSize(b.name).feet ?? 999) ||
            Number(readSize(a.name).highCube) - Number(readSize(b.name).highCube)
        )
      : items

  return (
    <section aria-label={panel.title} className="flex min-w-0 flex-col rounded-2xl surface p-4 sm:p-5">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full brand-fill text-primary-foreground">
            <PanelIcon className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
              {panel.title}
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                {pagination.total}
              </span>
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">{panel.description}</p>
          </div>
        </div>
        <PermissionGate resource="masterData" write>
          <ContainerLookupForm kind={kind} mode="create" name={undefined} isActive={true} id={undefined} />
        </PermissionGate>
      </header>

      <DataTableToolbar
        searchPlaceholder={kind === "size" ? "Search sizes..." : "Search types..."}
        filters={lookupFilters}
        applied={applied}
        onApply={setApplied}
      />

      {!isRestored || isLoading ? (
        <div className={cn("grid gap-3", kind === "size" ? "sm:grid-cols-2" : "")}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className={kind === "size" ? "h-36 rounded-xl" : "h-20 rounded-xl"} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <ReferenceEmpty
          icon={<PanelIcon />}
          title={`No ${panel.noun} found`}
          description="Try another search, or clear the filters."
        />
      ) : (
        <ul className={cn("grid gap-3", kind === "size" ? "sm:grid-cols-2" : "")}>
          {sorted.map((item) =>
            kind === "size" ? (
              <SizeTile key={item.id ?? item.name} item={item} />
            ) : (
              <TypeTile key={item.id ?? item.name} item={item} />
            )
          )}
        </ul>
      )}

      <ReferencePager
        className="mt-5 border-t border-border/70 pt-4"
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={pagination.totalPages}
        total={pagination.total}
        noun={panel.noun}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </section>
  )
}

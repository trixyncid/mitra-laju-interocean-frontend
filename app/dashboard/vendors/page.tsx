"use client"

import { useMemo } from "react"
import Link from "next/link"
import type { Row } from "@tanstack/react-table"
import { IconBuildingStore, IconList, IconPlus, IconTable } from "@tabler/icons-react"

import { columns, type Vendor } from "./columns"
import { DataTable } from "./data-table"
import { useVendors } from "@/hooks/use-vendors"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
import { usePersistedChoice } from "@/hooks/use-persisted-choice"
import TableSkeleton from "@/components/loading/table-skeleton"
import ErrorPage from "@/components/error-page"
import VendorActionCell from "@/components/action-cell/vendor-action-cell"
import { DirectoryPager, ViewToggle } from "@/components/directory/primitives"
import { SupplierRoster } from "@/components/directory/supplier-roster"
import { DataTableToolbar } from "@/components/data-table-toolbar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"
import { ActiveColumnFilters, ColumnFilterBar } from "@/components/column-filter/column-filter"
import { VENDOR_FILTER_PILLS } from "@/components/vendors/vendor-filter-fields"
import { VendorFilterProvider, vendorFilterParams } from "@/components/vendors/vendor-filter-provider"
import { VendorExportButton } from "@/components/vendors/vendor-export-button"
import { cn } from "@/lib/utils"

type ShipmentTypeFilter = "all" | "EXPORT" | "IMPORT" | "DOMESTIC"
type StatusFilter = "all" | "true" | "false"
const VIEWS = ["roster", "table"] as const

const TYPE_PILLS: { value: ShipmentTypeFilter; label: string }[] = [
  { value: "all", label: "All work" },
  { value: "EXPORT", label: "Export" },
  { value: "IMPORT", label: "Import" },
  { value: "DOMESTIC", label: "Domestic" },
]

const STATUS_PILLS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Any status" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
]

function useVendorCount(status: StatusFilter, enabled: boolean) {
  const { data } = useVendors({ page: 1, pageSize: 1, status, shipmentType: "all" }, enabled)
  return data?.pagination.total
}

function Pills<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (next: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 overflow-x-auto rounded-full bg-muted p-1 [scrollbar-width:none]">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-7 shrink-0 cursor-pointer rounded-full px-3 text-xs font-medium transition-colors",
            value === option.value
              ? "bg-card text-foreground shadow-elev-1"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default function VendorMasterDataPage() {
  const {
    applied,
    page,
    pageSize,
    setApplied,
    setPage,
    setPageSize,
    isRestored,
  } = usePersistedTableState("vendors")
  const [view, setView] = usePersistedChoice("mli:vendors-view", VIEWS, "roster")

  const shipmentType = (applied.shipmentType ?? "all") as ShipmentTypeFilter
  const status = applied.status as StatusFilter

  // Both views share the search, pills and column filters. The roster is
  // always A–Z, so it pages by name; the table follows the chosen sort.
  const params = useMemo(() => {
    const sort = view === "roster" ? ({ by: "vendorName", dir: "asc" } as const) : applied.sort
    return {
      page,
      pageSize,
      ...vendorFilterParams(applied),
      sortBy: sort?.by,
      sortDir: sort?.dir,
    }
  }, [page, pageSize, applied, view])
  const { data, isLoading, error } = useVendors(params, isRestored)
  const vendors = data?.items ?? []
  const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }

  const total = useVendorCount("all", isRestored)
  const active = useVendorCount("true", isRestored)
  const inactive = useVendorCount("false", isRestored)

  if (error) return <ErrorPage />

  const show = (value: number | undefined) => (value === undefined ? "–" : value)

  return (
    <DashboardPage atmosphere>
      <DashboardPageHeader
        title="Vendors"
        description="The shipping lines, truckers and agents you work with, listed A to Z."
        action={
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <ViewToggle
              label="How to show vendors"
              value={view}
              onChange={setView}
              options={[
                { value: "roster", label: "A–Z list", icon: IconList },
                { value: "table", label: "Table", icon: IconTable },
              ]}
            />
            <PermissionGate resource="masterData" write>
              <Button asChild>
                <Link href="/dashboard/vendors/new">
                  <IconPlus className="size-4" />
                  Add vendor
                </Link>
              </Button>
            </PermissionGate>
          </div>
        }
      />

      {/* One slim ledger bar: the numbers on the left, the filters on the right. */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl surface p-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <dl className="flex items-center gap-6">
          <div>
            <dt className="text-xs text-muted-foreground">Vendors</dt>
            <dd className="text-2xl font-semibold tracking-tight tabular-nums">{show(total)}</dd>
          </div>
          <span aria-hidden className="h-9 w-px bg-border" />
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-[var(--mli-positive)]" />
              Active
            </dt>
            <dd className="text-2xl font-semibold tracking-tight tabular-nums">{show(active)}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-[var(--mli-negative)]" />
              Inactive
            </dt>
            <dd className="text-2xl font-semibold tracking-tight tabular-nums">{show(inactive)}</dd>
          </div>
        </dl>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Pills
            label="Type of work"
            value={shipmentType}
            options={TYPE_PILLS}
            onChange={(next) => setApplied({ ...applied, shipmentType: next })}
          />
          <Pills
            label="Status"
            value={status}
            options={STATUS_PILLS}
            onChange={(next) => setApplied({ ...applied, status: next })}
          />
        </div>
      </div>

      <VendorFilterProvider
        applied={applied}
        onChange={({ columns: nextColumns, sort }) => setApplied({ ...applied, columns: nextColumns, sort })}
      >
        {view === "table" ? (
          <DashboardPageCard>
            {!isRestored || isLoading ? (
              <TableSkeleton />
            ) : (
              <DataTable
                columns={columns}
                data={vendors}
                page={pagination.page}
                pageSize={pagination.pageSize}
                totalPages={pagination.totalPages}
                totalRows={pagination.total}
                applied={applied}
                onApply={setApplied}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            )}
          </DashboardPageCard>
        ) : (
          <section>
            <DataTableToolbar
              searchPlaceholder="Search by vendor name or code..."
              applied={applied}
              onApply={setApplied}
              extra={<VendorExportButton applied={applied} totalRows={pagination.total} />}
            />
            <ColumnFilterBar items={VENDOR_FILTER_PILLS} className="mb-3" />
            <ActiveColumnFilters />
            {!isRestored || isLoading ? (
              <div className="grid gap-2 xl:grid-cols-2">
                {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : vendors.length === 0 ? (
              <div className="rounded-2xl surface px-6 py-16 text-center">
                <IconBuildingStore className="mx-auto size-10 text-muted-foreground/60" />
                <p className="mt-3 font-semibold text-foreground">No vendors found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try another name or code, or clear the filters.
                </p>
              </div>
            ) : (
              <SupplierRoster
                vendors={vendors}
                renderActions={(vendor) => (
                  <VendorActionCell row={{ original: vendor } as Row<Vendor>} />
                )}
              />
            )}
            <DirectoryPager
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalPages={pagination.totalPages}
              totalRows={pagination.total}
              noun="vendors"
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </section>
        )}
      </VendorFilterProvider>
    </DashboardPage>
  )
}

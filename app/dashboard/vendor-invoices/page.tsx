"use client"

import Link from "next/link"
import { Suspense, useMemo } from "react"
import { IconLayoutColumns, IconListDetails, IconPlus, IconTable } from "@tabler/icons-react"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import { breakdownColumns } from "./breakdown-columns"
import { BreakdownDataTable } from "./breakdown-data-table"
import { VendorInvoiceExportActions } from "./vendor-invoice-export-actions"
import {
  columnValues,
  INVOICE_FILTER_FIELDS,
  LINE_FILTER_FIELDS,
  VENDOR_INVOICE_SORT_LABELS,
} from "./column-filter-fields"
import { ColumnFilterProvider } from "@/components/column-filter/column-filter"
import { vendorInvoiceKeys } from "@/lib/query-keys"
import { vendorInvoiceService } from "@/services/vendor-invoice.service"
import {
  useVendorInvoiceBreakdowns,
  useVendorInvoices,
} from "@/hooks/use-vendor-invoices"
import { useLinkedView } from "@/hooks/use-linked-view"
import { usePersistedChoice } from "@/hooks/use-persisted-choice"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
import TableSkeleton from "@/components/loading/table-skeleton"
import ErrorPage from "@/components/error-page"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"
import { Button } from "@/components/ui/button"
import { VendorInvoiceWorkspace } from "@/components/vendor-invoices/vendor-invoice-workspace"
import { cn } from "@/lib/utils"

type ViewMode = "split" | "invoices" | "lines"

const VIEWS = [
  { value: "split" as const, label: "Split view", short: "List", icon: IconLayoutColumns },
  { value: "invoices" as const, label: "Invoices", short: "Invoices", icon: IconTable },
  { value: "lines" as const, label: "All lines", short: "Lines", icon: IconListDetails },
]

function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (view: ViewMode) => void }) {
  return (
    <div role="radiogroup" aria-label="View" className="flex h-10 items-center rounded-full bg-card p-1">
      {VIEWS.map(({ value, label, short, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={view === value}
          onClick={() => onChange(value)}
          className={cn(
            "flex h-full cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors",
            view === value ? "brand-fill" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="size-4" />
          <span className="lg:hidden">{short}</span>
          <span className="hidden lg:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}

function InvoicesTable({
  state,
}: {
  state: ReturnType<typeof usePersistedTableState>
}) {
  const { applied, page, pageSize, setApplied, setPage, setPageSize, isRestored } = state
  // The table filters by its column menus only; the split view keeps its own toolbar filters.
  const params = useMemo(
    () => ({
      page,
      pageSize,
      search: applied.search || undefined,
      columns: columnValues(applied.columns, INVOICE_FILTER_FIELDS),
      sortBy: applied.sort?.by,
      sortDir: applied.sort?.dir,
    }),
    [page, pageSize, applied]
  )
  const facetParams = useMemo(() => ({ search: params.search, columns: params.columns }), [params.search, params.columns])
  const { data, isLoading, error } = useVendorInvoices(params, isRestored)
  const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }

  if (error) return <ErrorPage message={error.message} />

  return !isRestored || isLoading ? (
    <TableSkeleton />
  ) : (
    <ColumnFilterProvider
      columns={applied.columns}
      sort={applied.sort}
      fields={INVOICE_FILTER_FIELDS}
      sortLabels={VENDOR_INVOICE_SORT_LABELS}
      onChange={({ columns: nextColumns, sort }) => setApplied({ ...applied, columns: nextColumns, sort })}
      facetKey={[...vendorInvoiceKeys.all, "facets", "invoices", facetParams]}
      fetchFacets={(field) => vendorInvoiceService.getFacets("invoices", field, facetParams)}
    >
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={pagination.totalPages}
        totalRows={pagination.total}
        applied={applied}
        onApply={setApplied}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </ColumnFilterProvider>
  )
}

function LinesTable() {
  const { applied, page, pageSize, setApplied, setPage, setPageSize, isRestored } =
    usePersistedTableState("vendorInvoices.breakdowns")
  const params = useMemo(
    () => ({
      page,
      pageSize,
      search: applied.search || undefined,
      columns: columnValues(applied.columns, LINE_FILTER_FIELDS),
      sortBy: applied.sort?.by,
      sortDir: applied.sort?.dir,
    }),
    [page, pageSize, applied]
  )
  const facetParams = useMemo(() => ({ search: params.search, columns: params.columns }), [params.search, params.columns])
  const { data, isLoading, error } = useVendorInvoiceBreakdowns(params, isRestored)
  const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }

  if (error) return <ErrorPage message={error.message} />

  return !isRestored || isLoading ? (
    <TableSkeleton />
  ) : (
    <ColumnFilterProvider
      columns={applied.columns}
      sort={applied.sort}
      fields={LINE_FILTER_FIELDS}
      sortLabels={VENDOR_INVOICE_SORT_LABELS}
      onChange={({ columns: nextColumns, sort }) => setApplied({ ...applied, columns: nextColumns, sort })}
      facetKey={[...vendorInvoiceKeys.all, "facets", "lines", facetParams]}
      fetchFacets={(field) => vendorInvoiceService.getFacets("lines", field, facetParams)}
    >
      <BreakdownDataTable
        columns={breakdownColumns}
        data={data?.items ?? []}
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={pagination.totalPages}
        totalRows={pagination.total}
        applied={applied}
        onApply={setApplied}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </ColumnFilterProvider>
  )
}

function VendorInvoicesContent() {
  const invoiceState = usePersistedTableState("vendorInvoices.invoices")
  const [savedView, saveView] = usePersistedChoice<ViewMode>(
    "mli:vendor-invoices:view",
    ["split", "invoices", "lines"],
    "invoices"
  )
  const [view, setView] = useLinkedView(savedView, saveView, "invoice", "split")

  return (
    <DashboardPage>
      <DashboardPageHeader
        className="mb-5 lg:mb-6"
        title="Vendor Invoices"
        description="Each invoice from a vendor, broken down into the charges it contains."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ViewToggle view={view} onChange={setView} />
            <VendorInvoiceExportActions />
            <PermissionGate resource="vendor-invoices" write>
              <Button asChild>
                <Link href="/dashboard/vendor-invoices/new">
                  <IconPlus className="size-4" />
                  New vendor invoice
                </Link>
              </Button>
            </PermissionGate>
          </div>
        }
      />

      {view === "split" ? (
        invoiceState.isRestored ? (
          <VendorInvoiceWorkspace
            applied={invoiceState.applied}
            onApply={invoiceState.setApplied}
            enabled={invoiceState.isRestored}
          />
        ) : (
          <TableSkeleton />
        )
      ) : (
        <DashboardPageCard>
          {view === "invoices" ? <InvoicesTable state={invoiceState} /> : <LinesTable />}
        </DashboardPageCard>
      )}
    </DashboardPage>
  )
}

export default function VendorInvoicePage() {
  return (
    <Suspense fallback={null}>
      <VendorInvoicesContent />
    </Suspense>
  )
}

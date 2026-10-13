"use client"

import { Suspense, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { IconLayoutColumns, IconTable } from "@tabler/icons-react"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import ErrorPage from "@/components/error-page"
import TableSkeleton from "@/components/loading/table-skeleton"
import { DashboardPage, DashboardPageCard, DashboardPageHeader } from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"
import { SalesFilterProvider, salesFilterParams } from "@/components/sales/sales-filter-provider"
import { SalesFormDialog } from "@/components/sales/sales-form-dialog"
import { SalesWorkspace } from "@/components/sales/sales-workspace"
import { useLinkedView } from "@/hooks/use-linked-view"
import { usePersistedChoice } from "@/hooks/use-persisted-choice"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
import { useSalesPage } from "@/hooks/use-sales"
import { cn } from "@/lib/utils"

type ViewMode = "split" | "table"

function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (view: ViewMode) => void }) {
  const options = [
    { value: "split" as const, label: "Split view", icon: IconLayoutColumns },
    { value: "table" as const, label: "Table", icon: IconTable },
  ]
  return (
    <div role="radiogroup" aria-label="View" className="flex h-10 items-center rounded-full bg-card p-1">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={view === value}
          onClick={() => onChange(value)}
          className={cn(
            "flex h-full cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors",
            view === value ? "brand-fill" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="size-4" />
          {value === "split" ? (
            <>
              <span className="lg:hidden">List</span>
              <span className="hidden lg:inline">{label}</span>
            </>
          ) : (
            label
          )}
        </button>
      ))}
    </div>
  )
}

/** Every job as a paged, filterable table; filters are shared with the split view. */
function SalesTable({ state }: { state: ReturnType<typeof usePersistedTableState> }) {
  const { applied, page, pageSize, setApplied, setPage, setPageSize, isRestored } = state
  const params = useMemo(() => ({ page, pageSize, ...salesFilterParams(applied) }), [page, pageSize, applied])
  const { data, isLoading, error } = useSalesPage(params, isRestored)
  const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }

  if (error) return <ErrorPage message={error.message} />
  if (!isRestored || isLoading) return <TableSkeleton />

  return (
    <SalesFilterProvider
      applied={applied}
      onChange={({ columns: nextColumns, sort }) => setApplied({ ...applied, columns: nextColumns, sort })}
    >
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        summary={data?.summary}
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={pagination.totalPages}
        totalRows={pagination.total}
        applied={applied}
        onApply={setApplied}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </SalesFilterProvider>
  )
}

function SalesContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const state = usePersistedTableState("sales")
  const { applied, setApplied, isRestored } = state
  const [savedView, saveView] = usePersistedChoice<ViewMode>("mli:sales:view", ["split", "table"], "table")
  const [view, setView] = useLinkedView(savedView, saveView, "sales", "split")
  const openNew = searchParams.get("new") === "1"

  const showSales = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (id) params.set("sales", id)
    params.delete("new")
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        className="mb-5 lg:mb-6"
        title="Sales"
        description="Each job ties a shipment (or other work) to its costings and sellings, so you can see what it earned."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ViewToggle view={view} onChange={setView} />
            <PermissionGate resource="sales" action="create">
              <SalesFormDialog
                mode="create"
                defaultOpen={openNew}
                onOpenChange={(open) => {
                  if (!open && openNew) showSales(null)
                }}
                onSaved={(sales) => (view === "table" ? router.push(`/dashboard/sales/${sales.id}`) : showSales(sales.id))}
              />
            </PermissionGate>
          </div>
        }
      />
      {view === "split" ? (
        isRestored ? (
          <SalesWorkspace applied={applied} onApply={setApplied} enabled={isRestored} />
        ) : (
          <TableSkeleton />
        )
      ) : (
        <DashboardPageCard>
          <SalesTable state={state} />
        </DashboardPageCard>
      )}
    </DashboardPage>
  )
}

export default function SalesPage() {
  return (
    <Suspense fallback={null}>
      <SalesContent />
    </Suspense>
  )
}

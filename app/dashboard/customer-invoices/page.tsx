"use client"

import { Suspense, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { IconLayoutColumns, IconTable } from "@tabler/icons-react"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import {
  CustomerInvoiceFilterProvider,
  customerInvoiceFilterParams,
} from "@/components/customer-invoices/customer-invoice-filter-provider"
import { CustomerInvoiceFormDialog } from "@/components/customer-invoices/customer-invoice-form-dialog"
import { CustomerInvoiceWorkspace } from "@/components/customer-invoices/customer-invoice-workspace"
import ErrorPage from "@/components/error-page"
import TableSkeleton from "@/components/loading/table-skeleton"
import { DashboardPage, DashboardPageCard, DashboardPageHeader } from "@/components/layout/dashboard-page"
import { useCustomerInvoicesPage } from "@/hooks/use-customer-invoices"
import { usePermissions } from "@/hooks/use-permissions"
import { useLinkedView } from "@/hooks/use-linked-view"
import { usePersistedChoice } from "@/hooks/use-persisted-choice"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
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

/** Every invoice as a paged, filterable table; filters are shared with the split view. */
function InvoicesTable({ state }: { state: ReturnType<typeof usePersistedTableState> }) {
  const { applied, page, pageSize, setApplied, setPage, setPageSize, isRestored } = state
  const params = useMemo(() => ({ page, pageSize, ...customerInvoiceFilterParams(applied) }), [page, pageSize, applied])
  const { data, isLoading, error } = useCustomerInvoicesPage(params, isRestored)
  const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }

  if (error) return <ErrorPage message={error.message} />
  if (!isRestored || isLoading) return <TableSkeleton />

  return (
    <CustomerInvoiceFilterProvider
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
    </CustomerInvoiceFilterProvider>
  )
}

function CustomerInvoicesContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { can } = usePermissions()
  const state = usePersistedTableState("customer-invoices")
  const { applied, setApplied, isRestored } = state
  const [savedView, saveView] = usePersistedChoice<ViewMode>("mli:customer-invoices:view", ["split", "table"], "table")
  const [view, setView] = useLinkedView(savedView, saveView, "invoice", "split")

  const showInvoice = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("invoice", id)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        className="mb-5 lg:mb-6"
        title="Customer Invoices"
        description="Bills for each sales job's sellings, and what customers still owe."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ViewToggle view={view} onChange={setView} />
            {/* Picking the job to bill needs the sales list. */}
            {can("CUSTOMER_INVOICE", "create") && can("SALES", "view") ? (
              <CustomerInvoiceFormDialog
                mode="create"
                onSaved={(invoice) =>
                  view === "table" ? router.push(`/dashboard/customer-invoices/${invoice.id}`) : showInvoice(invoice.id)
                }
              />
            ) : null}
          </div>
        }
      />
      {view === "split" ? (
        isRestored ? (
          <CustomerInvoiceWorkspace applied={applied} onApply={setApplied} enabled={isRestored} />
        ) : (
          <TableSkeleton />
        )
      ) : (
        <DashboardPageCard>
          <InvoicesTable state={state} />
        </DashboardPageCard>
      )}
    </DashboardPage>
  )
}

export default function CustomerInvoicesPage() {
  return (
    <Suspense fallback={null}>
      <CustomerInvoicesContent />
    </Suspense>
  )
}

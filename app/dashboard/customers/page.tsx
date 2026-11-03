"use client"

import { useMemo } from "react"
import Link from "next/link"
import type { Row } from "@tanstack/react-table"
import {
  IconCircleCheck,
  IconLayoutGrid,
  IconPlaneArrival,
  IconPlaneDeparture,
  IconPlus,
  IconTable,
  IconTruck,
  IconUsersGroup,
} from "@tabler/icons-react"

import { DataTable } from "./data-table"
import { columns, type Customer } from "./columns"
import { useCustomers } from "@/hooks/use-customers"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
import { usePersistedChoice } from "@/hooks/use-persisted-choice"
import TableSkeleton from "@/components/loading/table-skeleton"
import ErrorPage from "@/components/error-page"
import CustomerActionCell from "@/components/action-cell/customer-action-cell"
import { ClientCard } from "@/components/directory/client-card"
import { DirectoryPager, StatTile, ViewToggle } from "@/components/directory/primitives"
import { DataTableToolbar } from "@/components/data-table-toolbar"
import { ActiveColumnFilters, ColumnFilterBar } from "@/components/column-filter/column-filter"
import { CUSTOMER_FILTER_BAR } from "@/components/customers/customer-filter-fields"
import { CustomerFilterProvider, customerFilterParams } from "@/components/customers/customer-filter-provider"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"

type ShipmentTypeFilter = "all" | "EXPORT" | "IMPORT" | "DOMESTIC"
const VIEWS = ["cards", "table"] as const

/** Total for one slice of the directory (a page of one row is enough). */
function useCustomerCount(
  filter: { status?: "all" | "true"; shipmentType?: ShipmentTypeFilter },
  enabled: boolean
) {
  const { data } = useCustomers(
    { page: 1, pageSize: 1, status: filter.status ?? "all", shipmentType: filter.shipmentType ?? "all" },
    enabled
  )
  return data?.pagination.total
}

function CardGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} className="h-52 rounded-2xl" />
      ))}
    </div>
  )
}

export default function CustomerMasterDataPage() {
  const {
    applied,
    page,
    pageSize,
    setApplied,
    setPage,
    setPageSize,
    isRestored,
  } = usePersistedTableState("customers")
  const [view, setView] = usePersistedChoice("mli:customers-view", VIEWS, "cards")

  const shipmentType = (applied.shipmentType ?? "all") as ShipmentTypeFilter
  const status = applied.status as "all" | "true" | "false"

  // Both views share the search, the stat tiles and the Excel-style column filters.
  const params = useMemo(
    () => ({ page, pageSize, ...customerFilterParams(applied) }),
    [page, pageSize, applied]
  )
  const { data, isLoading, error } = useCustomers(params, isRestored)
  const customers = data?.items ?? []
  const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }

  const total = useCustomerCount({}, isRestored)
  const active = useCustomerCount({ status: "true" }, isRestored)
  const exportCount = useCustomerCount({ shipmentType: "EXPORT" }, isRestored)
  const importCount = useCustomerCount({ shipmentType: "IMPORT" }, isRestored)
  const domesticCount = useCustomerCount({ shipmentType: "DOMESTIC" }, isRestored)

  if (error) return <ErrorPage message={error.message} />

  const pickType = (next: ShipmentTypeFilter) =>
    setApplied({ ...applied, shipmentType: shipmentType === next ? "all" : next })

  const show = (value: number | undefined) => (value === undefined ? "–" : value)

  return (
    <DashboardPage atmosphere>
      <DashboardPageHeader
        title="Customers"
        description="Every company you ship for. Open a customer to see their shippers, places and shipments."
        action={
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <ViewToggle
              label="How to show customers"
              value={view}
              onChange={setView}
              options={[
                { value: "cards", label: "Cards", icon: IconLayoutGrid },
                { value: "table", label: "Table", icon: IconTable },
              ]}
            />
            <PermissionGate resource="masterData" write>
              <Button asChild>
                <Link href="/dashboard/customers/new">
                  <IconPlus className="size-4" />
                  Add customer
                </Link>
              </Button>
            </PermissionGate>
          </div>
        }
      />

      {/* Numbers double as quick filters. */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatTile
          label="All customers"
          value={show(total)}
          hint="Show everyone"
          icon={IconUsersGroup}
          active={status === "all" && shipmentType === "all"}
          onClick={() => setApplied({ ...applied, status: "all", shipmentType: "all" })}
          className="col-span-2 md:col-span-1"
        />
        <StatTile
          label="Active"
          value={show(active)}
          hint={
            total && active !== undefined ? `${Math.round((active / Math.max(total, 1)) * 100)}% of all` : "Can be used now"
          }
          icon={IconCircleCheck}
          accent="bg-[var(--mli-success-container)] text-[var(--mli-on-success-container)]"
          active={status === "true"}
          onClick={() => setApplied({ ...applied, status: status === "true" ? "all" : "true" })}
        />
        <StatTile
          label="Export"
          value={show(exportCount)}
          hint="Ship goods out"
          icon={IconPlaneDeparture}
          accent="bg-[var(--mli-export-container)] text-[var(--mli-on-export-container)]"
          active={shipmentType === "EXPORT"}
          onClick={() => pickType("EXPORT")}
        />
        <StatTile
          label="Import"
          value={show(importCount)}
          hint="Bring goods in"
          icon={IconPlaneArrival}
          accent="bg-[var(--mli-import-container)] text-[var(--mli-on-import-container)]"
          active={shipmentType === "IMPORT"}
          onClick={() => pickType("IMPORT")}
        />
        <StatTile
          label="Domestic"
          value={show(domesticCount)}
          hint="Inside Indonesia"
          icon={IconTruck}
          accent="bg-[var(--mli-domestic-container)] text-[var(--mli-on-domestic-container)]"
          active={shipmentType === "DOMESTIC"}
          onClick={() => pickType("DOMESTIC")}
        />
      </div>

      <CustomerFilterProvider
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
                data={customers}
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
              searchPlaceholder="Search by customer name or code..."
              applied={applied}
              onApply={setApplied}
            />
            {/* Cards have no column headers, so the same filters sit in pills. */}
            <ColumnFilterBar items={CUSTOMER_FILTER_BAR} className="mb-3 sm:flex-wrap sm:gap-y-2" />
            <ActiveColumnFilters />
            {!isRestored || isLoading ? (
              <CardGridSkeleton />
            ) : customers.length === 0 ? (
              <div className="rounded-2xl surface px-6 py-16 text-center">
                <IconUsersGroup className="mx-auto size-10 text-muted-foreground/60" />
                <p className="mt-3 font-semibold text-foreground">No customers found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try another name or code, or clear the filters.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {customers.map((customer) => (
                  <ClientCard
                    key={customer.id}
                    customer={customer}
                    href={`/dashboard/customers/${customer.id}`}
                    actions={
                      <CustomerActionCell row={{ original: customer } as Row<Customer>} />
                    }
                  />
                ))}
              </div>
            )}
            <DirectoryPager
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalPages={pagination.totalPages}
              totalRows={pagination.total}
              noun="customers"
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </section>
        )}
      </CustomerFilterProvider>
    </DashboardPage>
  )
}

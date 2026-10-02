"use client"

import { useMemo } from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useSellings } from "@/hooks/use-sellings"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
import TableSkeleton from "@/components/loading/table-skeleton"
import ErrorPage from "@/components/error-page"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"

export default function SellingPage() {
  const {
    applied,
    page,
    pageSize,
    setApplied,
    setPage,
    setPageSize,
    isRestored,
  } = usePersistedTableState("sellings")
  const params = useMemo(
    () => ({
      page,
      pageSize,
      search: applied.search || undefined,
      status: applied.status as "all" | "DRAFT" | "PAID" | "UNPAID",
      from: applied.dateRange.from,
      to: applied.dateRange.to,
    }),
    [page, pageSize, applied]
  )
  const { data, isLoading, error } = useSellings(params, isRestored)
  const sellings = data?.items ?? []
  const pagination = data?.pagination ?? {
    page,
    pageSize,
    total: 0,
    totalPages: 1,
  }

  if (error) return <ErrorPage message={error.message} />

  return (
    <DashboardPage atmosphere>
      <DashboardPageHeader
        title="Customer invoices"
        description="Customer invoices built from shipment costing markup. Create invoices from a shipment detail page."
      />
      <DashboardPageCard>
        {!isRestored || isLoading ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={sellings}
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
    </DashboardPage>
  )
}

"use client"

import { useMemo } from "react"
import Link from "next/link"
import { IconPlus } from "@tabler/icons-react"

import { DataTable } from "./data-table"
import { columns } from "./columns"
import { useCustomers } from "@/hooks/use-customers"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
import TableSkeleton from "@/components/loading/table-skeleton"
import ErrorPage from "@/components/error-page"
import { Button } from "@/components/ui/button"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"

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
  const { data, isLoading, error } = useCustomers(params, isRestored)
  const customers = data?.items ?? []
  const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }

  if (error) return <ErrorPage message={error.message} />

  return (
    <DashboardPage atmosphere>
      <DashboardPageHeader
        title="Customer Management"
        description="View and manage your client database, view profiles, and update contact information."
        action={
          <PermissionGate resource="masterData" write>
            <Button asChild>
              <Link href="/dashboard/customers/new">
                <IconPlus className="size-4" />
                Add customer
              </Link>
            </Button>
          </PermissionGate>
        }
      />
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
    </DashboardPage>
  )
}

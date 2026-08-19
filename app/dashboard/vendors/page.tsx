"use client"

import { useMemo } from "react"
import Link from "next/link"
import { IconPlus } from "@tabler/icons-react"

import { DataTable } from "./data-table"
import { columns } from "./columns"
import { useVendors } from "@/hooks/use-vendors"
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
  const { data, isLoading, error } = useVendors(params, isRestored)
  const vendors = data?.items ?? []
  const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }

  if (error) return <ErrorPage message={error.message} />

  return (
    <DashboardPage atmosphere>
      <DashboardPageHeader
        title="Vendor Management"
        description="View and manage vendors based on vendor code, name, NPWP, and status."
        action={
          <PermissionGate resource="masterData" write>
            <Button asChild>
              <Link href="/dashboard/vendors/new">
                <IconPlus className="size-4" />
                Add vendor
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
    </DashboardPage>
  )
}

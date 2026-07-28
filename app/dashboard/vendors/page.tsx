"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { IconPlus } from "@tabler/icons-react"

import { DataTable } from "./data-table"
import { columns } from "./columns"
import { useVendors } from "@/hooks/use-vendors"
import TableSkeleton from "@/components/loading/table-skeleton"
import ErrorPage from "@/components/error-page"
import { Button } from "@/components/ui/button"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"
import { type AppliedTableFilters } from "@/components/data-table-toolbar"

export default function VendorMasterDataPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [applied, setApplied] = useState<AppliedTableFilters>({
    search: "",
    status: "all",
    dateRange: {},
  })
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
  const { data, isLoading, error } = useVendors(params)
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
        {isLoading ? (
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
            onApply={(next) => {
              setApplied(next)
              setPage(1)
            }}
            onPageChange={setPage}
            onPageSizeChange={(next) => {
              setPageSize(next)
              setPage(1)
            }}
          />
        )}
      </DashboardPageCard>
    </DashboardPage>
  )
}

"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { IconPlus } from "@tabler/icons-react"

import { DataTable } from "./data-table"
import { columns } from "./columns"
import { useCustomers } from "@/hooks/use-customers"
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

export default function CustomerMasterDataPage() {
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
  const { data, isLoading, error } = useCustomers(params)
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
        {isLoading ? (
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

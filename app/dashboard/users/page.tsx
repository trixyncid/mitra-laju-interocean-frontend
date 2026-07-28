"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { IconPlus } from "@tabler/icons-react"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import ErrorPage from "@/components/error-page"
import { Button } from "@/components/ui/button"
import TableSkeleton from "@/components/loading/table-skeleton"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { type AppliedTableFilters } from "@/components/data-table-toolbar"
import { useRequireAdmin } from "@/hooks/use-require-admin"
import { useUsers } from "@/hooks/use-users"

export default function UserManagementPage() {
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
  const { isPending: isSessionPending, canManageUsers, isRedirecting } = useRequireAdmin()
  const { data, isLoading, error } = useUsers(params)
  const users = data?.items ?? []
  const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }

  if (isSessionPending || isRedirecting || !canManageUsers) {
    return (
      <DashboardPage atmosphere>
        <DashboardPageCard>
          <TableSkeleton />
        </DashboardPageCard>
      </DashboardPage>
    )
  }

  if (error) {
    return <ErrorPage message={error.message} />
  }

  return (
    <DashboardPage atmosphere>
      <DashboardPageHeader
        title="User Management"
        description="Create, update, and deactivate application users. Deactivated users cannot sign in; their existing data is preserved."
        action={
          <Button asChild>
            <Link href="/dashboard/users/new">
              <IconPlus className="size-4" />
              Add staff
            </Link>
          </Button>
        }
      />
      <DashboardPageCard>
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={users}
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

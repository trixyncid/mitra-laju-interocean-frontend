"use client"

import { useMemo } from "react"
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
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
import { useRequireAdmin } from "@/hooks/use-require-admin"
import { useUsers } from "@/hooks/use-users"

export default function UserManagementPage() {
  const {
    applied,
    page,
    pageSize,
    setApplied,
    setPage,
    setPageSize,
    isRestored,
  } = usePersistedTableState("users")
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
  const { data, isLoading, error } = useUsers(params, isRestored)
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
        {!isRestored || isLoading ? (
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
            onApply={setApplied}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </DashboardPageCard>
    </DashboardPage>
  )
}

"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import UserForm from "@/components/forms/user-form"
import ErrorPage from "@/components/error-page"
import TableSkeleton from "@/components/loading/table-skeleton"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { useRequireAdmin } from "@/hooks/use-require-admin"
import { useUsers } from "@/hooks/use-users"

export default function UserManagementPage() {
  const { isPending: isSessionPending, isAdmin, isRedirecting } = useRequireAdmin()
  const { data, isLoading, error } = useUsers()

  if (isSessionPending || isRedirecting || !isAdmin) {
    return (
      <DashboardPage>
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
    <DashboardPage>
      <DashboardPageHeader
        title="User Management"
        description="Create, update, and deactivate application users. Deactivated users cannot sign in; their existing data is preserved."
        action={<UserForm mode="create" />}
      />
      <DashboardPageCard>
        {isLoading ? <TableSkeleton /> : <DataTable columns={columns} data={data ?? []} />}
      </DashboardPageCard>
    </DashboardPage>
  )
}

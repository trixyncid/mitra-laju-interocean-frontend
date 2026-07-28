"use client"

import TableSkeleton from "@/components/loading/table-skeleton"
import RoleForm from "@/components/forms/role-form"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { useRequireSystemAdmin } from "@/hooks/use-require-system-admin"

export default function NewRolePage() {
  const { isPending, isSystemAdmin, isRedirecting } = useRequireSystemAdmin()

  if (isPending || isRedirecting || !isSystemAdmin) {
    return (
      <DashboardPage atmosphere>
        <DashboardPageCard>
          <TableSkeleton />
        </DashboardPageCard>
      </DashboardPage>
    )
  }

  return (
    <DashboardPage atmosphere>
      <DashboardPageHeader
        title="Create role"
        description="Define a new role and configure module access."
      />
      <DashboardPageCard>
        <RoleForm mode="create" />
      </DashboardPageCard>
    </DashboardPage>
  )
}

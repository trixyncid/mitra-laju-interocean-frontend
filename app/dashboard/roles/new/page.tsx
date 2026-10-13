"use client"

import TableSkeleton from "@/components/loading/table-skeleton"
import RoleForm from "@/components/forms/role-form"
import { RolePageHero } from "@/components/admin/role-page-hero"
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
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
      <RolePageHero />
      <DashboardPageCard>
        <RoleForm mode="create" />
      </DashboardPageCard>
    </DashboardPage>
  )
}

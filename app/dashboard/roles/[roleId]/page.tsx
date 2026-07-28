"use client"

import { use } from "react"

import ErrorPage from "@/components/error-page"
import TableSkeleton from "@/components/loading/table-skeleton"
import RoleForm from "@/components/forms/role-form"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { useRequireSystemAdmin } from "@/hooks/use-require-system-admin"
import { useRoleById } from "@/hooks/use-roles"

export default function EditRolePage({
  params,
}: {
  params: Promise<{ roleId: string }>
}) {
  const { roleId } = use(params)
  const { isPending: isSessionPending, isSystemAdmin, isRedirecting } =
    useRequireSystemAdmin()
  const { data: role, isLoading, error } = useRoleById(roleId)

  if (isSessionPending || isRedirecting || !isSystemAdmin || isLoading) {
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

  if (!role) {
    return <ErrorPage message="Role not found." />
  }

  return (
    <DashboardPage atmosphere>
      <DashboardPageHeader
        title={`Edit ${role.name}`}
        description={
          role.isSystem
            ? "System role — name and description only."
            : "Update role details and permission matrix."
        }
      />
      <DashboardPageCard>
        <RoleForm mode="edit" role={role} />
      </DashboardPageCard>
    </DashboardPage>
  )
}

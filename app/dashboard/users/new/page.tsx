"use client"

import Link from "next/link"
import { IconArrowLeft } from "@tabler/icons-react"

import UserForm from "@/components/forms/user-form"
import TableSkeleton from "@/components/loading/table-skeleton"
import { UserCreateSidebar } from "@/components/user-create-sidebar"
import { Button } from "@/components/ui/button"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { useRequireAdmin } from "@/hooks/use-require-admin"

export default function NewUserPage() {
  const { isPending, canManageUsers, isRedirecting } = useRequireAdmin()

  if (isPending || isRedirecting || !canManageUsers) {
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
        title="Add Staff"
        description="Create a new staff account with role and login credentials."
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard/users">
              <IconArrowLeft className="size-4" />
              Back to users
            </Link>
          </Button>
        }
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <aside className="lg:sticky lg:top-6">
          <UserCreateSidebar />
        </aside>
        <DashboardPageCard>
          <UserForm mode="create" />
        </DashboardPageCard>
      </div>
    </DashboardPage>
  )
}

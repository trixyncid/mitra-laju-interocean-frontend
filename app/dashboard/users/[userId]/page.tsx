"use client"

import Link from "next/link"
import { use } from "react"
import { IconArrowLeft } from "@tabler/icons-react"

import UserForm from "@/components/forms/user-form"
import ErrorPage from "@/components/error-page"
import TableSkeleton from "@/components/loading/table-skeleton"
import { PermissionFallback } from "@/components/permission-fallback"
import { UserMetadataCard } from "@/components/user-metadata-card"
import UserResetPasswordDialog from "@/components/user-reset-password-dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { useRequireAdmin } from "@/hooks/use-require-admin"
import { useUserById } from "@/hooks/use-users"

export default function EditUserPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = use(params)
  const { isPending: isSessionPending, canEditUsers } = useRequireAdmin({
    action: "edit",
    redirect: false,
  })
  const { data: user, isLoading, error } = useUserById(
    canEditUsers ? userId : undefined
  )

  if (isSessionPending) {
    return (
      <DashboardPage atmosphere>
        <DashboardPageCard>
          <TableSkeleton />
        </DashboardPageCard>
      </DashboardPage>
    )
  }

  if (!canEditUsers) {
    return (
      <PermissionFallback
        title="Edit staff"
        message="You do not have permission to edit users."
        backHref="/dashboard/users"
        backLabel="Back to users"
      />
    )
  }

  if (isLoading) {
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

  if (!user) {
    return <ErrorPage title="User not found" message="Unable to load this staff account." />
  }

  return (
    <DashboardPage atmosphere>
      <DashboardPageHeader
        title={user.name}
        description="Manage staff account details, photo, and access."
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
          <UserMetadataCard user={user} />
        </aside>
        <DashboardPageCard>
          <UserForm mode="edit" user={user} />
          <Separator className="my-10" />
          <div className="space-y-4">
            <div>
              <h2 className="text-headline-md font-semibold">Reset password</h2>
              <p className="text-sm text-muted-foreground">
                Generate a temporary password for this user. They should change it after signing in.
              </p>
            </div>
            <UserResetPasswordDialog user={user} triggerLabel="Reset password" />
          </div>
        </DashboardPageCard>
      </div>
    </DashboardPage>
  )
}

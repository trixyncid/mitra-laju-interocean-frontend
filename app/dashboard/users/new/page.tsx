"use client"

import Link from "next/link"
import { IconArrowLeft, IconUserPlus } from "@tabler/icons-react"

import UserForm from "@/components/forms/user-form"
import { AccessBadgePreview } from "@/components/admin/access-badge-preview"
import TableSkeleton from "@/components/loading/table-skeleton"
import { PermissionFallback } from "@/components/permission-fallback"
import { Button } from "@/components/ui/button"
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
import { useRequireAdmin } from "@/hooks/use-require-admin"

export default function NewUserPage() {
  const { isPending, canCreateUsers } = useRequireAdmin({
    action: "create",
    redirect: false,
  })

  if (isPending) {
    return (
      <DashboardPage atmosphere>
        <DashboardPageCard>
          <TableSkeleton />
        </DashboardPageCard>
      </DashboardPage>
    )
  }

  if (!canCreateUsers) {
    return (
      <PermissionFallback
        title="Add person"
        message="You cannot add people."
        backHref="/dashboard/users"
        backLabel="Back to team"
      />
    )
  }

  return (
    <DashboardPage atmosphere>
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3 text-muted-foreground">
        <Link href="/dashboard/users">
          <IconArrowLeft className="size-4" />
          Team
        </Link>
      </Button>
      <header className="mb-6 flex items-center gap-4 lg:mb-8">
        <span className="brand-fill flex size-12 shrink-0 items-center justify-center rounded-2xl">
          <IconUserPlus className="size-6" />
        </span>
        <div className="min-w-0">
          <h1 className="text-headline-lg">Add a person</h1>
          <p className="text-body-md text-muted-foreground">
            Make an account so they can sign in. Their staff card fills in as you type.
          </p>
        </div>
      </header>
      <DashboardPageCard>
        <UserForm mode="create" renderPreview={(preview) => <AccessBadgePreview {...preview} />} />
      </DashboardPageCard>
    </DashboardPage>
  )
}

"use client"

import Link from "next/link"
import { use } from "react"
import { IconArrowLeft, IconCalendar, IconClock, IconKey, IconMail, IconShieldCheck } from "@tabler/icons-react"

import UserForm from "@/components/forms/user-form"
import ErrorPage from "@/components/error-page"
import TableSkeleton from "@/components/loading/table-skeleton"
import { PermissionFallback } from "@/components/permission-fallback"
import { ProfileAvatarUpload } from "@/components/profile-avatar-upload"
import UserResetPasswordDialog from "@/components/user-reset-password-dialog"
import { Button } from "@/components/ui/button"
import { RoleChip } from "@/components/ui/role-chip"
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
import { useRequireAdmin } from "@/hooks/use-require-admin"
import { useUserById } from "@/hooks/use-users"
import { cn, localDate } from "@/lib/utils"

function SignInBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        active
          ? "bg-[var(--mli-success-container)] text-[var(--mli-on-success-container)]"
          : "bg-muted text-muted-foreground"
      )}
    >
      <span className={cn("size-1.5 rounded-full", active ? "bg-current" : "bg-muted-foreground/60")} />
      {active ? "Can sign in" : "Cannot sign in"}
    </span>
  )
}

function SideCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof IconKey
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="surface rounded-2xl p-5">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="surface-inset flex size-8 items-center justify-center rounded-lg text-primary">
          <Icon className="size-4" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}

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
        title="Edit person"
        message="You cannot change people's accounts."
        backHref="/dashboard/users"
        backLabel="Back to team"
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
    return <ErrorPage title="Person not found" message="We could not load this account." />
  }

  const active = user.isActive !== false

  return (
    <DashboardPage atmosphere>
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-3 text-muted-foreground">
        <Link href="/dashboard/users">
          <IconArrowLeft className="size-4" />
          Team
        </Link>
      </Button>

      <header className="surface relative mb-6 overflow-hidden rounded-3xl lg:mb-8">
        <div
          aria-hidden
          className="h-20 bg-[linear-gradient(120deg,rgba(var(--mli-brand-rgb),0.22),rgba(var(--mli-brand-rgb),0.06)_60%,rgba(var(--mli-brand-rgb),0.02))] sm:h-24"
        />
        <div className="flex flex-col gap-5 px-5 pb-6 sm:px-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
            {/* Only the photo overlaps the band; the text sits below it. */}
            <div className="relative z-10 -mt-12 self-start sm:-mt-14">
              <ProfileAvatarUpload
                userId={user.id}
                name={user.name}
                hasAvatar={!!user.image}
                avatarVersion={user.updatedAt}
                layout="hero"
              />
            </div>
            <div className="min-w-0 space-y-2 sm:pt-4">
              <h1 className="truncate text-headline-lg">{user.name}</h1>
              <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                <IconMail className="size-4 shrink-0" />
                {user.email}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <RoleChip role={user.roleRef?.name ?? user.role} />
                <SignInBadge active={active} />
              </div>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-6 text-sm lg:pb-1">
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <IconCalendar className="size-3.5" />
                Joined
              </dt>
              <dd className="mt-0.5 font-semibold text-foreground">{localDate(user.createdAt)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <IconClock className="size-3.5" />
                Last changed
              </dt>
              <dd className="mt-0.5 font-semibold text-foreground">{localDate(user.updatedAt)}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <DashboardPageCard>
          <UserForm mode="edit" user={user} />
        </DashboardPageCard>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <SideCard icon={IconKey} title="Password">
            <p className="mb-4 text-sm text-muted-foreground">
              Forgot their password? Make a new one-time password and send it to them. They
              change it after they sign in.
            </p>
            <UserResetPasswordDialog user={user} triggerLabel="Make a new password" />
          </SideCard>
          <SideCard icon={IconShieldCheck} title="Sign-in">
            <p className="text-sm text-muted-foreground">
              {active
                ? "This person can sign in. To stop them, choose Inactive under Status and save."
                : "This person cannot sign in. To let them back in, choose Active under Status and save."}
            </p>
          </SideCard>
        </aside>
      </div>
    </DashboardPage>
  )
}

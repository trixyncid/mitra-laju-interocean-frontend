"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { IconLayoutGrid, IconPlus, IconTable } from "@tabler/icons-react"

import { getUserColumns, type User } from "./columns"
import { DataTable, userFilters } from "./data-table"
import ErrorPage from "@/components/error-page"
import { PersonAvatar } from "@/components/admin/person-avatar"
import { roleLabelOf, TeamGrid } from "@/components/admin/team-grid"
import { useViewPreference } from "@/components/admin/use-view-preference"
import { DataTableToolbar } from "@/components/data-table-toolbar"
import { Button } from "@/components/ui/button"
import TableSkeleton from "@/components/loading/table-skeleton"
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
import { PageHeaderMark } from "@/components/layout/page-header-mark"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
import { useRequireAdmin } from "@/hooks/use-require-admin"
import { useUsers } from "@/hooks/use-users"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const VIEWS = ["cards", "table"] as const

function HeroStat({ value, label, tone }: { value: number | string; label: string; tone?: "good" | "muted" }) {
  return (
    <div className="min-w-0">
      <p
        className={cn(
          "text-2xl font-semibold tracking-tight tabular-nums text-foreground",
          tone === "good" && "text-[var(--mli-on-success-container)]",
          tone === "muted" && "text-muted-foreground"
        )}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function TeamHero({
  users,
  total,
  onePage,
  canCreate,
}: {
  users: User[]
  total: number
  onePage: boolean
  canCreate: boolean
}) {
  const active = users.filter((user) => user.isActive !== false).length
  const roles = new Set(users.map(roleLabelOf)).size
  const faces = users.filter((user) => user.isActive !== false).slice(0, 5)
  const suffix = onePage ? "" : " (this page)"

  return (
    <header className="surface relative mb-6 overflow-hidden rounded-3xl p-5 sm:p-7 lg:mb-8">
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-3">
          <PageHeaderMark title="Team" />
          <h1 className="text-headline-lg">Team</h1>
          <p className="max-w-xl text-body-md text-muted-foreground">
            Everyone who can use this system. Add people, give them a role, or stop someone
            from signing in. Their work is always kept.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          {faces.length ? (
            <div className="flex items-center" aria-hidden>
              {faces.map((user, index) => (
                <PersonAvatar
                  key={user.id}
                  userId={user.id}
                  name={user.name}
                  hasImage={!!user.image}
                  version={user.updatedAt}
                  className={cn("size-11 ring-[3px] ring-card", index && "-ml-2")}
                />
              ))}
              {active > faces.length ? (
                <span className="-ml-2 flex size-11 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground ring-[3px] ring-card">
                  +{active - faces.length}
                </span>
              ) : null}
            </div>
          ) : null}
          {canCreate ? (
            <Button asChild>
              <Link href="/dashboard/users/new">
                <IconPlus className="size-4" />
                Add person
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
      <div className="relative mt-6 grid grid-cols-2 gap-4 border-t border-border/60 pt-5 sm:grid-cols-4">
        <HeroStat value={total} label="People" />
        <HeroStat value={active} label={`Can sign in${suffix}`} tone="good" />
        <HeroStat value={users.length - active} label={`Cannot sign in${suffix}`} tone="muted" />
        <HeroStat value={roles} label={`Roles in use${suffix}`} />
      </div>
    </header>
  )
}

function ViewSwitch({ value, onChange }: { value: (typeof VIEWS)[number]; onChange: (next: (typeof VIEWS)[number]) => void }) {
  const options = [
    { value: "cards" as const, label: "Cards", icon: IconLayoutGrid },
    { value: "table" as const, label: "Table", icon: IconTable },
  ]
  return (
    <div role="radiogroup" aria-label="How to show people" className="surface-inset flex gap-1 rounded-full p-1">
      {options.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors",
              active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <option.icon className="size-4" />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function RoleChips({
  users,
  value,
  onChange,
}: {
  users: User[]
  value: string | null
  onChange: (next: string | null) => void
}) {
  const counts = new Map<string, number>()
  for (const user of users) counts.set(roleLabelOf(user), (counts.get(roleLabelOf(user)) ?? 0) + 1)
  const chips = [{ label: "Everyone", key: null as string | null, count: users.length }].concat(
    [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([label, count]) => ({ label, key: label, count }))
  )
  if (counts.size < 2) return null

  return (
    <div className="flex flex-wrap gap-2" aria-label="Show a role">
      {chips.map((chip) => {
        const active = value === chip.key
        return (
          <button
            key={chip.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(chip.key)}
            className={cn(
              "flex h-8 cursor-pointer items-center gap-2 rounded-full px-3 text-[13px] font-medium transition-colors",
              active ? "brand-fill" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {chip.label}
            <span className={cn("text-xs tabular-nums", active ? "text-primary-foreground/80" : "text-muted-foreground/80")}>
              {chip.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function CardPager({
  page,
  totalPages,
  total,
  shown,
  onPageChange,
}: {
  page: number
  totalPages: number
  total: number
  shown: number
  onPageChange: (page: number) => void
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>
        Showing {shown} of {total} {total === 1 ? "person" : "people"}
      </span>
      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <span className="mr-1">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </div>
      ) : null}
    </div>
  )
}

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
  const {
    isPending: isSessionPending,
    canViewUsers,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    isRedirecting,
  } = useRequireAdmin({ action: "view" })
  const { data: session } = authClient.useSession()
  const { data, isLoading, error } = useUsers(params, isRestored)
  const [view, setView] = useViewPreference("mli.users.view", VIEWS, "cards")
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const users = useMemo(() => data?.items ?? [], [data?.items])
  const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }
  const columns = getUserColumns({ canEditUsers, canDeleteUsers })
  // A role picked on another page may not exist on this one.
  const activeRole = roleFilter && users.some((user) => roleLabelOf(user) === roleFilter) ? roleFilter : null
  const shownUsers = activeRole ? users.filter((user) => roleLabelOf(user) === activeRole) : users

  if (isSessionPending || isRedirecting || !canViewUsers) {
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

  const loading = !isRestored || isLoading

  return (
    <DashboardPage atmosphere>
      <TeamHero
        users={users}
        total={pagination.total}
        onePage={pagination.totalPages <= 1}
        canCreate={canCreateUsers}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">People</h2>
        <ViewSwitch value={view} onChange={setView} />
      </div>

      {view === "table" ? (
        <DashboardPageCard>
          {loading ? (
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
      ) : (
        <>
          <div className="surface mb-6 space-y-3 rounded-2xl p-4">
            <DataTableToolbar
              searchPlaceholder="Search name or email..."
              filters={userFilters}
              applied={applied}
              onApply={setApplied}
              className="pb-0"
            />
            {loading ? null : <RoleChips users={users} value={activeRole} onChange={setRoleFilter} />}
          </div>
          {loading ? (
            <DashboardPageCard>
              <TableSkeleton />
            </DashboardPageCard>
          ) : (
            <>
              <TeamGrid
                users={shownUsers}
                showInactiveOpen={applied.status === "false"}
                canEditUsers={canEditUsers}
                canDeleteUsers={canDeleteUsers}
                selfId={session?.user?.id}
              />
              <CardPager
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                shown={shownUsers.length}
                onPageChange={setPage}
              />
            </>
          )}
        </>
      )}
    </DashboardPage>
  )
}

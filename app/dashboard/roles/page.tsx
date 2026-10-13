"use client"

import Link from "next/link"
import { IconPlus, IconSearch, IconShieldLock } from "@tabler/icons-react"
import { useMemo, useState } from "react"

import ErrorPage from "@/components/error-page"
import { RANK_DOT, RANK_LABEL, RoleCard, type AccessRank } from "@/components/admin/role-card"
import { Button } from "@/components/ui/button"
import TableSkeleton from "@/components/loading/table-skeleton"
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
import { PageHeaderMark } from "@/components/layout/page-header-mark"
import { useRequireSystemAdmin } from "@/hooks/use-require-system-admin"
import { useDeleteRole, useRoles } from "@/hooks/use-roles"
import { cn } from "@/lib/utils"

const RANKS: AccessRank[] = [0, 1, 2, 3]

function DotKey() {
  return (
    <div className="surface-inset rounded-2xl p-4">
      <p className="mb-3 text-xs font-medium text-muted-foreground">How to read a card</p>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
        {RANKS.map((rank) => (
          <li key={rank} className="flex items-center gap-2 text-sm text-foreground">
            <span aria-hidden className={cn("h-2.5 w-5 rounded-full", RANK_DOT[rank])} />
            {RANK_LABEL[rank]}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">One mark for each page. Point at a mark to see its name.</p>
    </div>
  )
}

export default function RoleManagementPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const params = useMemo(
    () => ({ page, pageSize: 20, search: search || undefined }),
    [page, search]
  )
  const { isPending: isSessionPending, isSystemAdmin, isRedirecting } =
    useRequireSystemAdmin()
  const { data, isLoading, error } = useRoles(params)
  const deleteRole = useDeleteRole()
  const roles = data?.items ?? []
  const pagination = data?.pagination ?? { page, pageSize: 20, total: 0, totalPages: 1 }
  const people = roles.reduce((sum, role) => sum + role._count.users, 0)
  const custom = roles.filter((role) => !role.isSystem).length

  if (isSessionPending || isRedirecting || !isSystemAdmin) {
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
      <header className="mb-6 grid gap-6 lg:mb-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end">
        <div className="min-w-0 space-y-3">
          <PageHeaderMark title="Roles" />
          <h1 className="text-headline-lg">Roles</h1>
          <p className="max-w-xl text-body-md text-muted-foreground">
            A role is a set of pages a person can open and change. Give each person one role
            on the Team page.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-sm">
            <span>
              <span className="font-semibold tabular-nums text-foreground">{pagination.total}</span>{" "}
              <span className="text-muted-foreground">roles</span>
            </span>
            <span>
              <span className="font-semibold tabular-nums text-foreground">{custom}</span>{" "}
              <span className="text-muted-foreground">custom roles</span>
            </span>
            <span>
              <span className="font-semibold tabular-nums text-foreground">{people}</span>{" "}
              <span className="text-muted-foreground">people with a role</span>
            </span>
          </div>
        </div>
        <DotKey />
      </header>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="surface relative flex h-11 w-full items-center rounded-full sm:max-w-sm">
          <IconSearch className="pointer-events-none absolute left-4 size-4 text-muted-foreground" />
          <span className="sr-only">Search roles</span>
          <input
            className="h-full w-full rounded-full bg-transparent pr-4 pl-11 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/30"
            placeholder="Search by role name or code…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </label>
        <Button asChild>
          <Link href="/dashboard/roles/new">
            <IconPlus className="size-4" />
            New role
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <DashboardPageCard>
          <TableSkeleton />
        </DashboardPageCard>
      ) : roles.length === 0 ? (
        <div className="surface flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center">
          <span className="surface-inset flex size-12 items-center justify-center rounded-full text-muted-foreground">
            <IconShieldLock className="size-6" />
          </span>
          <p className="font-medium text-foreground">No roles found</p>
          <p className="max-w-sm text-sm text-muted-foreground">Try another name, or make a new role.</p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onDelete={(onSuccess) => deleteRole.mutate(role.id, { onSuccess })}
              deleting={deleteRole.isPending}
            />
          ))}
        </ul>
      )}

      {pagination.totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </DashboardPage>
  )
}

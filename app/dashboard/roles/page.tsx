"use client"

import Link from "next/link"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { useMemo, useState } from "react"

import ErrorPage from "@/components/error-page"
import { Button } from "@/components/ui/button"
import { DeleteConfirmButton } from "@/components/ui/delete-confirm-button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import TableSkeleton from "@/components/loading/table-skeleton"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { useRequireSystemAdmin } from "@/hooks/use-require-system-admin"
import { useDeleteRole, useRoles } from "@/hooks/use-roles"
import { chipBase, chipInfo, primaryText, secondaryText } from "@/lib/design"
import type { Role } from "@/services/roles.service"
import { cn } from "@/lib/utils"

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
      <DashboardPageHeader
        title="Role Management"
        description="Create custom roles and configure which modules and actions each role can access."
        action={
          <Button asChild>
            <Link href="/dashboard/roles/new">
              <IconPlus className="size-4" />
              Add role
            </Link>
          </Button>
        }
      />
      <DashboardPageCard>
        <div className="mb-4">
          <input
            className="h-9 w-full max-w-sm rounded-md border border-input bg-transparent px-3 text-sm"
            placeholder="Search roles…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border/60">
                  <th className="px-2 py-2 font-medium">Name</th>
                  <th className="px-2 py-2 font-medium">Slug</th>
                  <th className="px-2 py-2 font-medium">System</th>
                  <th className="px-2 py-2 font-medium">Users</th>
                  <th className="px-2 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <RoleRow
                    key={role.id}
                    role={role}
                    onDelete={(onSuccess) =>
                      deleteRole.mutate(role.id, { onSuccess })
                    }
                    deleting={deleteRole.isPending}
                  />
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
                roles)
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
          </div>
        )}
      </DashboardPageCard>
    </DashboardPage>
  )
}

function RoleRow({
  role,
  onDelete,
  deleting,
}: {
  role: Role
  onDelete: (onSuccess?: () => void) => void
  deleting: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <tr className="border-b border-border/40">
      <td className="px-2 py-3">
        <Link
          href={`/dashboard/roles/${role.id}`}
          className={`${primaryText} hover:underline`}
        >
          {role.name}
        </Link>
        {role.description ? (
          <p className={`${secondaryText} mt-0.5 line-clamp-1`}>{role.description}</p>
        ) : null}
      </td>
      <td className={`px-2 py-3 ${secondaryText}`}>{role.slug}</td>
      <td className="px-2 py-3">
        <span className={role.isSystem ? chipInfo() : cn(chipBase, "bg-secondary/80 text-secondary-foreground")}>
          {role.isSystem ? "System" : "Custom"}
        </span>
      </td>
      <td className={`px-2 py-3 ${secondaryText}`}>{role._count.users}</td>
      <td className="px-2 py-3">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/roles/${role.id}`}>Edit</Link>
          </Button>
          {!role.isSystem ? (
            <Dialog open={open} onOpenChange={(next) => {
              if (deleting) return
              setOpen(next)
            }}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={role._count.users > 0 || deleting}
                >
                  <IconTrash className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Role</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Are you sure you want to delete role "{role.name}"? Users must be
                  reassigned first.
                </DialogDescription>
                <DialogFooter>
                  <DeleteConfirmButton
                    isPending={deleting}
                    onClick={() => onDelete(() => setOpen(false))}
                  />
                  <DialogClose asChild>
                    <Button variant="secondary" disabled={deleting}>Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      </td>
    </tr>
  )
}

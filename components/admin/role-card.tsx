"use client"

import { useState } from "react"
import Link from "next/link"
import { IconCrown, IconPencil, IconShieldLock, IconTrash, IconUser } from "@tabler/icons-react"

import { ACCESS_GROUPS } from "@/components/roles/module-access-editor"
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
import { isFinancialModule, isModuleEnabled } from "@/lib/feature-flags"
import { MODULE_LABEL, type AppModule } from "@/lib/permissions"
import { cn } from "@/lib/utils"
import type { Role, RolePermission } from "@/services/roles.service"

export type AccessRank = 0 | 1 | 2 | 3

export const RANK_LABEL: Record<AccessRank, string> = {
  0: "No access",
  1: "View only",
  2: "Add & edit",
  3: "Full",
}

export const RANK_DOT: Record<AccessRank, string> = {
  0: "bg-muted-foreground/15",
  1: "bg-primary/30",
  2: "bg-primary/65",
  3: "bg-primary",
}

function rankOf(row: RolePermission | undefined): AccessRank {
  if (!row?.canView) return 0
  if (row.canDelete) return 3
  if (row.canCreate || row.canEdit) return 2
  return 1
}

const VISIBLE_GROUPS = ACCESS_GROUPS.map((group) => ({
  ...group,
  modules: group.modules.filter((module) => !isFinancialModule(module) || isModuleEnabled(module)),
})).filter((group) => group.modules.length > 0)

/** One dot per page, darker for more access. */
function AccessMap({ role }: { role: Role }) {
  const byModule = new Map(role.permissions.map((row) => [row.module, row]))
  const rank = (module: AppModule): AccessRank => (role.isSystem ? 3 : rankOf(byModule.get(module)))

  return (
    <dl className="space-y-2">
      {VISIBLE_GROUPS.map((group) => (
        <div key={group.label} className="flex items-center gap-3">
          <dt className="w-24 shrink-0 text-xs text-muted-foreground">{group.label}</dt>
          <dd className="flex flex-wrap gap-1.5">
            {group.modules.map((module) => {
              const level = rank(module)
              return (
                <span
                  key={module}
                  title={`${MODULE_LABEL[module]}: ${RANK_LABEL[level]}`}
                  aria-label={`${MODULE_LABEL[module]}: ${RANK_LABEL[level]}`}
                  role="img"
                  className={cn("h-2.5 w-5 rounded-full", RANK_DOT[level])}
                />
              )
            })}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function PeopleStack({ count }: { count: number }) {
  const shown = Math.min(count, 4)
  return (
    <span className="flex items-center gap-2">
      {shown ? (
        <span className="flex" aria-hidden>
          {Array.from({ length: shown }, (_, index) => (
            <span
              key={index}
              className={cn(
                "flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-card",
                index && "-ml-2"
              )}
            >
              <IconUser className="size-3.5" />
            </span>
          ))}
        </span>
      ) : null}
      <span className="text-sm text-muted-foreground">
        {count === 0 ? "No one yet" : count === 1 ? "1 person" : `${count} people`}
      </span>
    </span>
  )
}

function DeleteRoleButton({
  role,
  onDelete,
  deleting,
}: {
  role: Role
  onDelete: (onSuccess?: () => void) => void
  deleting: boolean
}) {
  const [open, setOpen] = useState(false)
  const inUse = role._count.users > 0

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (deleting) return
        setOpen(next)
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={inUse || deleting}
          title={inUse ? "Give its people a different role first" : "Delete role"}
          aria-label={`Delete ${role.name}`}
          className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)] hover:text-[var(--mli-on-error-container)]"
        >
          <IconTrash className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this role?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          The role &ldquo;{role.name}&rdquo; will be deleted. First give its users a different
          role.
        </DialogDescription>
        <DialogFooter>
          <DeleteConfirmButton isPending={deleting} onClick={() => onDelete(() => setOpen(false))} />
          <DialogClose asChild>
            <Button variant="secondary" disabled={deleting}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function RoleCard({
  role,
  onDelete,
  deleting,
}: {
  role: Role
  onDelete: (onSuccess?: () => void) => void
  deleting: boolean
}) {
  const hasAccess = role.isSystem || role.permissions.some((row) => row.canView)

  return (
    <li
      className={cn(
        "surface surface-lift relative flex flex-col overflow-hidden rounded-2xl",
        role.isSystem && "ring-1 ring-primary/25"
      )}
    >
      {role.isSystem ? <span aria-hidden className="brand-fill h-1.5 w-full" /> : null}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              role.isSystem ? "brand-fill" : "surface-inset text-primary"
            )}
          >
            {role.isSystem ? <IconCrown className="size-5" /> : <IconShieldLock className="size-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <Link
              href={`/dashboard/roles/${role.id}`}
              className="block truncate text-[15px] font-semibold text-foreground after:absolute after:inset-0 hover:underline"
            >
              {role.name}
            </Link>
            <p className="truncate font-mono text-xs text-muted-foreground">{role.slug}</p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
              role.isSystem ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}
          >
            {role.isSystem ? "System" : "Custom"}
          </span>
        </div>

        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
          {role.isSystem
            ? "Can open and change everything. This role cannot be changed."
            : role.description || "No description yet."}
        </p>

        <div className="surface-inset rounded-xl p-3">
          {hasAccess ? (
            <AccessMap role={role} />
          ) : (
            <p className="py-3 text-center text-xs text-muted-foreground">
              No pages yet. Open the role to choose what it can do.
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <PeopleStack count={role._count.users} />
          {/* Above the card-wide link so the buttons stay clickable. */}
          <div className="relative z-10 flex items-center gap-1">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/roles/${role.id}`}>
                <IconPencil className="size-4" />
                {role.isSystem ? "Open" : "Edit"}
              </Link>
            </Button>
            {!role.isSystem ? <DeleteRoleButton role={role} onDelete={onDelete} deleting={deleting} /> : null}
          </div>
        </div>
      </div>
    </li>
  )
}

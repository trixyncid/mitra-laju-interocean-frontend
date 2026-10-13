"use client"

import Link from "next/link"
import { IconChevronDown, IconPencil, IconUserOff, IconUsers } from "@tabler/icons-react"

import type { User } from "@/app/dashboard/users/columns"
import { DeactivateUserButton } from "@/components/admin/deactivate-user-button"
import { PersonAvatar } from "@/components/admin/person-avatar"
import { Button } from "@/components/ui/button"
import { formatRoleLabel } from "@/lib/permissions"
import { cn, localDate } from "@/lib/utils"

export function roleLabelOf(user: User) {
  return user.roleRef?.name ?? formatRoleLabel(user.role)
}

type CardPermissions = { canEditUsers: boolean; canDeleteUsers: boolean; selfId?: string }

function PersonCard({ user, canEditUsers, canDeleteUsers, selfId }: { user: User } & CardPermissions) {
  const active = user.isActive !== false
  const isSelf = user.id === selfId

  return (
    <li
      className={cn(
        "surface surface-lift group relative flex flex-col gap-3 rounded-2xl p-4",
        !active && "opacity-75"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="relative shrink-0">
          <PersonAvatar
            userId={user.id}
            name={user.name}
            hasImage={!!user.image}
            version={user.updatedAt}
            className={cn("size-12", !active && "grayscale")}
          />
          <span
            className={cn(
              "absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full ring-[3px] ring-card",
              active ? "bg-[var(--mli-on-success-container)]" : "bg-muted-foreground/50"
            )}
            title={active ? "Can sign in" : "Cannot sign in"}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2">
            {canEditUsers ? (
              <Link
                href={`/dashboard/users/${user.id}`}
                className="truncate text-[15px] font-semibold text-foreground after:absolute after:inset-0 after:rounded-2xl hover:underline"
              >
                {user.name}
              </Link>
            ) : (
              <span className="truncate text-[15px] font-semibold text-foreground">{user.name}</span>
            )}
            {isSelf ? (
              <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                You
              </span>
            ) : null}
          </p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-2.5">
        <p className="truncate text-xs text-muted-foreground">
          {active ? "Can sign in" : "Cannot sign in"} · Updated {localDate(user.updatedAt)}
        </p>
        {/* Above the card-wide link so the buttons stay clickable. */}
        <div className="relative z-10 flex shrink-0 items-center gap-1">
          {canEditUsers ? (
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href={`/dashboard/users/${user.id}`} aria-label={`Edit ${user.name}`} title="Edit">
                <IconPencil className="size-4" />
              </Link>
            </Button>
          ) : null}
          {canDeleteUsers && active ? <DeactivateUserButton user={user} isSelf={isSelf} /> : null}
        </div>
      </div>
    </li>
  )
}

function CardGrid({
  users,
  className,
  ...permissions
}: { users: User[]; className?: string } & CardPermissions) {
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", className)}>
      {users.map((user) => (
        <PersonCard key={user.id} user={user} {...permissions} />
      ))}
    </ul>
  )
}

/** People on cards, one group per role; people who cannot sign in fold away at the end. */
export function TeamGrid({
  users,
  showInactiveOpen,
  ...permissions
}: { users: User[]; showInactiveOpen: boolean } & CardPermissions) {
  const active = users.filter((user) => user.isActive !== false)
  const inactive = users.filter((user) => user.isActive === false)

  const groups = new Map<string, { label: string; isSystem: boolean; users: User[] }>()
  for (const user of active) {
    const label = roleLabelOf(user)
    const group = groups.get(label) ?? { label, isSystem: !!user.roleRef?.isSystem, users: [] }
    group.users.push(user)
    groups.set(label, group)
  }
  const ordered = [...groups.values()].sort(
    (a, b) => Number(b.isSystem) - Number(a.isSystem) || a.label.localeCompare(b.label)
  )

  if (users.length === 0) {
    return (
      <div className="surface flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center">
        <span className="surface-inset flex size-12 items-center justify-center rounded-full text-muted-foreground">
          <IconUsers className="size-6" />
        </span>
        <p className="font-medium text-foreground">No one matches your search</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Try another name, or clear the filters to see everyone.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* A board: one column per role, so small teams still fill the page. */}
      <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ordered.map((group) => (
          <section
            key={group.label}
            aria-label={group.label}
            className="surface-inset space-y-3 rounded-3xl p-3"
          >
            <div className="flex items-center gap-2 px-1 pt-1">
              <h2 className="truncate text-sm font-semibold text-foreground">{group.label}</h2>
              <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground shadow-sm">
                {group.users.length}
              </span>
            </div>
            <CardGrid users={group.users} className="sm:grid-cols-1 xl:grid-cols-1 2xl:grid-cols-1" {...permissions} />
          </section>
        ))}
      </div>

      {inactive.length ? (
        <details
          // Re-mount when the status filter changes so the open state follows it.
          key={String(showInactiveOpen)}
          open={showInactiveOpen}
          className="group/inactive space-y-3"
        >
          <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl py-1 [&::-webkit-details-marker]:hidden">
            <span className="surface-inset flex size-7 items-center justify-center rounded-full text-muted-foreground">
              <IconUserOff className="size-4" />
            </span>
            <span className="text-sm font-semibold text-foreground">Cannot sign in</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {inactive.length}
            </span>
            <span className="h-px flex-1 bg-border/70" aria-hidden />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="group-open/inactive:hidden">Show</span>
              <span className="hidden group-open/inactive:inline">Hide</span>
              <IconChevronDown className="size-4 transition-transform group-open/inactive:rotate-180" />
            </span>
          </summary>
          <div className="pt-3">
            <CardGrid users={inactive} {...permissions} />
          </div>
        </details>
      ) : null}
    </div>
  )
}

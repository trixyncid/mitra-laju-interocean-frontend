"use client"

import Link from "next/link"
import { Row } from "@tanstack/react-table"
import { IconPencil } from "@tabler/icons-react"

import type { User } from "@/app/dashboard/users/columns"
import { DeactivateUserButton } from "@/components/admin/deactivate-user-button"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export default function UserActionCell({
  row,
  canEditUsers,
  canDeleteUsers,
}: {
  row: Row<User>
  canEditUsers: boolean
  canDeleteUsers: boolean
}) {
  const { data: session } = authClient.useSession()
  const isSelf = session?.user?.id === row.original.id

  if (!canEditUsers && !canDeleteUsers) {
    return null
  }

  return (
    <div className="flex items-center gap-x-2">
      {canEditUsers ? (
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/users/${row.original.id}`} aria-label={`Edit ${row.original.name}`}>
            <IconPencil />
          </Link>
        </Button>
      ) : null}
      {canDeleteUsers && row.original.isActive !== false ? (
        <DeactivateUserButton user={row.original} isSelf={isSelf} />
      ) : null}
    </div>
  )
}

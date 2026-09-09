"use client"

import { useState } from "react"
import Link from "next/link"
import { Row } from "@tanstack/react-table"
import { IconPencil, IconUserOff } from "@tabler/icons-react"

import type { User } from "@/app/dashboard/users/columns"
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
import { authClient } from "@/lib/auth-client"
import { useDeleteUser } from "@/hooks/use-users"

export default function UserActionCell({
  row,
  canEditUsers,
  canDeleteUsers,
}: {
  row: Row<User>
  canEditUsers: boolean
  canDeleteUsers: boolean
}) {
  const deleteUser = useDeleteUser()
  const [open, setOpen] = useState(false)
  const { data: session } = authClient.useSession()
  const isSelf = session?.user?.id === row.original.id

  if (!canEditUsers && !canDeleteUsers) {
    return null
  }

  return (
    <div className="flex items-center gap-x-2">
      {canEditUsers ? (
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/users/${row.original.id}`}>
            <IconPencil />
          </Link>
        </Button>
      ) : null}
      {canDeleteUsers ? (
        <Dialog
          open={open}
          onOpenChange={(next) => {
            if (deleteUser.isPending) return
            setOpen(next)
          }}
        >
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isSelf}>
              <IconUserOff className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deactivate User</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              {isSelf
                ? "You cannot deactivate your own account while signed in."
                : `Deactivate ${row.original.name}? They will be signed out and removed from this list. Their existing records are not deleted.`}
            </DialogDescription>
            <DialogFooter>
              <DeleteConfirmButton
                isPending={deleteUser.isPending}
                disabled={isSelf}
                idleLabel="Deactivate"
                pendingLabel="Deactivating..."
                onClick={() => {
                  deleteUser.mutate(row.original.id, {
                    onSuccess: () => setOpen(false),
                  })
                }}
              />
              <DialogClose asChild>
                <Button variant="secondary" disabled={deleteUser.isPending}>
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  )
}

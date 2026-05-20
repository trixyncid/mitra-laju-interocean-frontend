"use client"

import { useState } from "react"
import { Row } from "@tanstack/react-table"
import { IconTrash } from "@tabler/icons-react"

import type { User } from "@/app/dashboard/users/columns"
import UserForm from "@/components/forms/user-form"
import UserResetPasswordDialog from "@/components/user-reset-password-dialog"
import { Button } from "@/components/ui/button"
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

export default function UserActionCell({ row }: { row: Row<User> }) {
  const deleteUser = useDeleteUser()
  const [open, setOpen] = useState(false)
  const { data: session } = authClient.useSession()
  const isSelf = session?.user?.id === row.original.id

  return (
    <div className="flex items-center gap-x-2">
      <UserForm mode="edit" user={row.original} />
      <UserResetPasswordDialog user={row.original} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isSelf}>
            <IconTrash className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" />
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
            <Button
              variant="destructive"
              disabled={isSelf}
              onClick={() => {
                deleteUser.mutate(row.original.id, {
                  onSuccess: () => setOpen(false),
                })
              }}
            >
              Deactivate
            </Button>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

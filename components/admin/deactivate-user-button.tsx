"use client"

import { useState } from "react"
import { IconUserOff } from "@tabler/icons-react"

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
import { useDeleteUser } from "@/hooks/use-users"

/** Stops a person from signing in. Their records stay. */
export function DeactivateUserButton({ user, isSelf }: { user: User; isSelf: boolean }) {
  const deleteUser = useDeleteUser()
  const [open, setOpen] = useState(false)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (deleteUser.isPending) return
        setOpen(next)
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isSelf}
          title={isSelf ? "You cannot turn off your own account" : `Stop ${user.name} from signing in`}
          aria-label={`Stop ${user.name} from signing in`}
          className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)] hover:text-[var(--mli-on-error-container)]"
        >
          <IconUserOff className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stop {user.name} from signing in?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {isSelf
            ? "You cannot turn off your own account while you are signed in."
            : `${user.name} will be signed out and cannot sign in again. Their work in the system is kept.`}
        </DialogDescription>
        <DialogFooter>
          <DeleteConfirmButton
            isPending={deleteUser.isPending}
            disabled={isSelf}
            idleLabel="Stop sign-in"
            pendingLabel="Stopping..."
            onClick={() => {
              deleteUser.mutate(user.id, { onSuccess: () => setOpen(false) })
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
  )
}

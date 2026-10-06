"use client"

import { useState } from "react"
import { IconTrash } from "@tabler/icons-react"

import { Button } from "../ui/button"
import { DeleteConfirmButton } from "../ui/delete-confirm-button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { useDeleteCosting } from "@/hooks/use-costings"

export default function LinkCostingForm({ id }: { id: string }) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteCosting = useDeleteCosting()

  return (
    <Dialog
      open={deleteOpen}
      onOpenChange={(next) => {
        if (deleteCosting.isPending) return
        setDeleteOpen(next)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Delete costing">
          <IconTrash className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete costing</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this costing? This action cannot be
            undone. To assign lines to shipments, open the costing detail page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DeleteConfirmButton
            isPending={deleteCosting.isPending}
            onClick={() => {
              deleteCosting.mutate(id, {
                onSuccess: () => {
                  setDeleteOpen(false)
                },
              })
            }}
          />
          <DialogClose asChild>
            <Button variant="secondary" disabled={deleteCosting.isPending}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

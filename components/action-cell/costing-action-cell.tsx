"use client"

import Link from "next/link"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import type { Row } from "@tanstack/react-table"
import { useState } from "react"

import type { Costing } from "@/app/dashboard/costings/columns"
import { DeleteConfirmButton } from "@/components/ui/delete-confirm-button"
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
import { useDeleteCosting } from "@/hooks/use-costings"
import { usePermissions } from "@/hooks/use-permissions"

export default function CostingActionCell({ row }: { row: Row<Costing> }) {
  const { canWrite } = usePermissions()
  const deleteCosting = useDeleteCosting()
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!canWrite("costings")) return null

  return (
    <div className="flex items-center gap-x-1">
      <Button variant="ghost" size="icon-sm" asChild>
        <Link href={`/dashboard/costings/${row.original.id}`}>
          <IconPencil className="size-4" />
          <span className="sr-only">Open</span>
        </Link>
      </Button>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <IconTrash className="size-4 text-[var(--mli-on-error-container)]" />
            <span className="sr-only">Delete</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete costing?</DialogTitle>
            <DialogDescription>
              This permanently removes {row.original.costingNumber} and all line
              items.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DeleteConfirmButton
              isPending={deleteCosting.isPending}
              onClick={() =>
                deleteCosting.mutate(row.original.id, {
                  onSuccess: () => setDeleteOpen(false),
                })
              }
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

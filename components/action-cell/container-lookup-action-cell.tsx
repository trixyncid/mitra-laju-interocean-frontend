"use client"

import ContainerLookupForm from "../forms/container-lookup-form"
import { Row } from "@tanstack/react-table"
import { ContainerLookup } from "@/app/dashboard/containers/columns"
import { useDeleteContainerLookup } from "@/hooks/use-container-lookups"
import { usePermissions } from "@/hooks/use-permissions"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DeleteConfirmButton } from "@/components/ui/delete-confirm-button"
import { IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import type { ContainerLookupKind } from "@/services/container-lookups.service"

export default function ContainerLookupActionCell({
  kind,
  row,
}: {
  kind: ContainerLookupKind
  row: Row<ContainerLookup>
}) {
  const { canWrite } = usePermissions()
  const deleteLookup = useDeleteContainerLookup(kind)
  const [open, setOpen] = useState(false)
  const entityLabel = kind === "size" ? "Size" : "Type"

  if (!canWrite("masterData")) return null

  return (
    <div className="flex items-center gap-x-2">
      <ContainerLookupForm
        kind={kind}
        mode="edit"
        name={row.original.name}
        isActive={row.original.isActive}
        id={row.original.id}
      />
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (deleteLookup.isPending) return
          setOpen(next)
        }}
      >
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <IconTrash className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Container {entityLabel}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this container {kind}? This action cannot be
            undone.
          </DialogDescription>
          <DialogFooter>
            <DeleteConfirmButton
              isPending={deleteLookup.isPending}
              onClick={() => {
                deleteLookup.mutate(row.original.id ?? "", {
                  onSuccess: () => {
                    setOpen(false)
                  },
                })
              }}
            />
            <DialogClose asChild>
              <Button variant="secondary" disabled={deleteLookup.isPending}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

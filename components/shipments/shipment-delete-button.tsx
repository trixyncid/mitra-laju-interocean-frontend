"use client"

import { useState } from "react"
import { IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

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
import { useDeleteShipment } from "@/hooks/use-shipments"

export function ShipmentDeleteButton({
  shipmentId,
  onDeleted,
}: {
  shipmentId: string
  onDeleted?: () => void
}) {
  const [open, setOpen] = useState(false)
  const deleteShipment = useDeleteShipment()

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (deleteShipment.isPending) return
        setOpen(next)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Delete shipment">
          <IconTrash className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Shipment</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this shipment? This action cannot be undone and will delete all related data.
        </DialogDescription>
        <DialogFooter>
          <DeleteConfirmButton
            isPending={deleteShipment.isPending}
            onClick={() => {
              deleteShipment.mutate(shipmentId, {
                onSuccess: () => {
                  setOpen(false)
                  onDeleted?.()
                },
                onError: (error: Error) => {
                  toast.warning(error.message)
                },
              })
            }}
          />
          <DialogClose asChild>
            <Button variant="secondary" disabled={deleteShipment.isPending}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

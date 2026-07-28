"use client"

import Link from "next/link"
import { useState } from "react"
import { Row } from "@tanstack/react-table"
import { IconPencil, IconTrash } from "@tabler/icons-react"

import type { Vendor } from "@/app/dashboard/vendors/columns"
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
import { useDeleteVendor } from "@/hooks/use-vendors"
import { usePermissions } from "@/hooks/use-permissions"

export default function VendorActionCell({ row }: { row: Row<Vendor> }) {
  const { canWrite } = usePermissions()
  const deleteVendor = useDeleteVendor()
  const [open, setOpen] = useState(false)

  if (!canWrite("masterData")) return null

  const vendorId = row.original.id

  return (
    <div className="flex items-center gap-x-2">
      <Button variant="outline" size="icon" asChild>
        <Link href={`/dashboard/vendors/${vendorId}`}>
          <IconPencil />
        </Link>
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (deleteVendor.isPending) return
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
            <DialogTitle>Delete Vendor</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this vendor? This action cannot be
            undone.
          </DialogDescription>
          <DialogFooter>
            <DeleteConfirmButton
              isPending={deleteVendor.isPending}
              onClick={() => {
                deleteVendor.mutate(
                  { id: vendorId ?? "" },
                  {
                    onSuccess: () => setOpen(false),
                  }
                )
              }}
            />
            <DialogClose asChild>
              <Button variant="secondary" disabled={deleteVendor.isPending}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import Link from "next/link"
import { useState } from "react"
import { Row } from "@tanstack/react-table"
import { IconPencil, IconTrash } from "@tabler/icons-react"

import type { Customer } from "@/app/dashboard/customers/columns"
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
import { useDeleteCustomer } from "@/hooks/use-customers"
import { usePermissions } from "@/hooks/use-permissions"

export default function CustomerActionCell({ row }: { row: Row<Customer> }) {
  const { canWrite } = usePermissions()
  const deleteCustomer = useDeleteCustomer()
  const [open, setOpen] = useState(false)

  if (!canWrite("masterData")) return null

  const customerId = row.original.id

  return (
    <div className="flex items-center gap-x-2">
      <Button variant="outline" size="icon" asChild>
        <Link href={`/dashboard/customers/${customerId}`}>
          <IconPencil />
        </Link>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <IconTrash className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this customer? This action cannot be
            undone.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                deleteCustomer.mutate(customerId ?? "", {
                  onSuccess: () => setOpen(false),
                })
              }}
            >
              Delete
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

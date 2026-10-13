"use client"

import { useState } from "react"
import { IconCircleCheck, IconRotate, IconTrash } from "@tabler/icons-react"

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
import { useDeleteCustomerInvoice, useUpdateCustomerInvoice } from "@/hooks/use-customer-invoices"
import type { CustomerInvoiceStatus } from "@/lib/types/customer-invoice"

type InvoiceRef = { id: string; customerInvoiceNumber: string; customerInvoiceStatus: CustomerInvoiceStatus }

/** One click to record payment (dated today) or reopen a paid invoice. */
export function InvoicePaymentButton({
  invoice,
  size = "sm",
  compact = false,
}: {
  invoice: InvoiceRef
  size?: "sm" | "default"
  /** In tables: "Mark unpaid" (the rare undo) shrinks to an icon; "Mark paid" keeps its label. */
  compact?: boolean
}) {
  const update = useUpdateCustomerInvoice()
  const paid = invoice.customerInvoiceStatus === "PAID"
  const iconOnly = compact && paid
  return (
    <Button
      variant={paid ? "ghost" : "outline"}
      size={iconOnly ? "icon-sm" : size}
      aria-label={iconOnly ? `Mark ${invoice.customerInvoiceNumber} unpaid` : undefined}
      title={iconOnly ? "Mark unpaid" : undefined}
      disabled={update.isPending}
      onClick={() =>
        update.mutate({
          id: invoice.id,
          invoice: { customerInvoiceStatus: paid ? "UNPAID" : "PAID" },
          message: paid ? `${invoice.customerInvoiceNumber} marked unpaid` : `${invoice.customerInvoiceNumber} marked paid`,
        })
      }
    >
      {paid ? <IconRotate className="size-4" /> : <IconCircleCheck className="size-4" />}
      {iconOnly ? null : (
        // In tables on phones the label stays for screen readers only, so the fixed column stays narrow.
        <span className={compact ? "max-sm:sr-only" : undefined}>{paid ? "Mark unpaid" : "Mark paid"}</span>
      )}
    </Button>
  )
}

export function DeleteInvoiceButton({ invoice, onDeleted }: { invoice: InvoiceRef; onDeleted?: () => void }) {
  const [open, setOpen] = useState(false)
  const remove = useDeleteCustomerInvoice()
  const paid = invoice.customerInvoiceStatus === "PAID"
  return (
    <Dialog open={open} onOpenChange={(next) => !remove.isPending && setOpen(next)}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Delete invoice ${invoice.customerInvoiceNumber}`} title="Delete invoice">
          <IconTrash className="size-4 text-[var(--mli-on-error-container)]" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{paid ? "A paid invoice can't be deleted" : `Delete ${invoice.customerInvoiceNumber}?`}</DialogTitle>
          <DialogDescription>
            {paid
              ? "Mark it unpaid first if it was recorded by mistake."
              : "Its sellings become unbilled again and the number can be used for a new invoice."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={remove.isPending}>
              {paid ? "Close" : "Cancel"}
            </Button>
          </DialogClose>
          {paid ? null : (
            <DeleteConfirmButton
              isPending={remove.isPending}
              onClick={() =>
                remove.mutate(invoice.id, {
                  onSuccess: () => {
                    setOpen(false)
                    onDeleted?.()
                  },
                })
              }
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

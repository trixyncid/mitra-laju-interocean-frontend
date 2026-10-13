"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { IconPencil, IconPlus } from "@tabler/icons-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  BreakdownLineFields,
  breakdownLinePayload,
  breakdownLineValues,
} from "@/components/forms/breakdown-line-fields"
import {
  useCreateVendorInvoiceBreakdown,
  useUpdateVendorInvoiceBreakdown,
} from "@/hooks/use-vendor-invoices"
import type { VendorInvoiceBreakdown } from "@/app/dashboard/vendor-invoices/columns"

export default function VendorInvoiceBreakdownForm({
  mode,
  vendorInvoiceId,
  breakdown,
  trigger,
}: {
  mode: "create" | "edit"
  vendorInvoiceId: string
  breakdown?: VendorInvoiceBreakdown
  trigger?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const createBreakdown = useCreateVendorInvoiceBreakdown(vendorInvoiceId)
  const updateBreakdown = useUpdateVendorInvoiceBreakdown(vendorInvoiceId)
  const [values, setValues] = useState(() => breakdownLineValues(breakdown))

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      setValues(breakdownLineValues(breakdown))
    }
  }

  const isPending = createBreakdown.isPending || updateBreakdown.isPending

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!values.productDescription.trim()) return

    const payload = breakdownLinePayload(values)

    if (mode === "create") {
      await createBreakdown.mutateAsync(payload)
    } else if (breakdown) {
      await updateBreakdown.mutateAsync({
        breakdownId: breakdown.id,
        breakdown: payload,
      })
    }
    setOpen(false)
    if (mode === "create") {
      setValues(breakdownLineValues(breakdown))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ??
          (mode === "create" ? (
            <Button size="sm">
              <IconPlus className="size-4" />
              Add line
            </Button>
          ) : (
            <Button variant="ghost" size="icon-sm">
              <IconPencil className="size-4" />
            </Button>
          ))}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add breakdown" : "Edit breakdown"}
          </DialogTitle>
          <DialogDescription>
            Describe the charge on this vendor invoice.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <BreakdownLineFields
            values={values}
            onChange={setValues}
            lookupsEnabled={open}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

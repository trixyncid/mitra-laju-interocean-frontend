"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { IconPencil } from "@tabler/icons-react"

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
import { DatePicker } from "@/components/ui/date-picker"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { TextField } from "@/components/ui/text-field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchableCombobox } from "@/components/searchable-combobox"
import { useUpdateVendorInvoice } from "@/hooks/use-vendor-invoices"
import { useVendorSearch } from "@/hooks/use-entity-searches"
import { usePermissions } from "@/hooks/use-permissions"
import type { Vendor } from "@/app/dashboard/vendors/columns"
import {
  vendorInvoiceVendorInvoiceTypeSchema,
  vendorInvoiceVendorSchema,
  vendorInvoiceNumberSchema,
} from "@/lib/schemas/vendor-invoice"
import { zodOnChange } from "@/lib/zod-form"
import { fieldError } from "@/lib/form-field"

function toDateInput(value?: string | null) {
  if (!value) return ""
  return value.slice(0, 10)
}

export default function VendorInvoiceHeaderForm({
  id,
  vendorId,
  vendorInvoiceNumber,
  vendorInvoiceDate,
  vendorInvoiceType = "INVOICE",
  vendorVessel,
  paymentDate,
  trigger,
}: {
  id: string
  vendorId: string
  vendorInvoiceNumber?: string | null
  vendorInvoiceDate?: string | null
  vendorInvoiceType?: "INVOICE" | "REIMBURSEMENT" | null
  vendorVessel?: string | null
  paymentDate?: string | null
  trigger?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const updateVendorInvoice = useUpdateVendorInvoice()
  const { canReadVendorsForVendorInvoice } = usePermissions()
  const [vendorSearch, setVendorSearch] = useState("")

  const {
    data: vendorsPage,
    isLoading: isLoadingVendors,
    isFetching: isFetchingVendors,
  } = useVendorSearch(
    vendorSearch,
    open && canReadVendorsForVendorInvoice(),
    "true"
  )

  const vendorItems = useMemo(
    () =>
      vendorsPage?.items
        ?.filter((vendor: Vendor) => vendor.id)
        .map((vendor: Vendor) => ({
          value: vendor.id as string,
          label: `${vendor.vendorName} (${vendor.vendorCode})`,
        })) ?? [],
    [vendorsPage?.items]
  )

  const form = useForm({
    defaultValues: {
      vendorId: vendorId || "-",
      vendorInvoiceType: (vendorInvoiceType === "REIMBURSEMENT"
        ? "REIMBURSEMENT"
        : "INVOICE") as "INVOICE" | "REIMBURSEMENT",
      vendorInvoiceNumber: vendorInvoiceNumber ?? "",
      vendorInvoiceDate: toDateInput(vendorInvoiceDate),
      vendorVessel: vendorVessel ?? "",
      paymentDate: toDateInput(paymentDate),
    },
    onSubmit: async ({ value }) => {
      const nextVendorId = value.vendorId === "-" ? undefined : value.vendorId
      if (!nextVendorId) return

      await updateVendorInvoice.mutateAsync({
        id,
        vendorInvoice: {
          vendorId: nextVendorId,
          vendorInvoiceType: value.vendorInvoiceType,
          vendorInvoiceNumber: value.vendorInvoiceNumber.trim(),
          vendorInvoiceDate: value.vendorInvoiceDate || null,
          vendorVessel: value.vendorVessel.trim() || null,
          paymentDate: value.paymentDate || null,
        },
      })
      setOpen(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <IconPencil className="size-4" />
            Edit invoice
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit vendor invoice</DialogTitle>
          <DialogDescription>
            Update invoice metadata and payment date. VAT and PPH 23 are set
            per breakdown line.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="vendorId"
            validators={{ onChange: zodOnChange(vendorInvoiceVendorSchema) }}
          >
            {(field) => (
              <SearchableCombobox
                label="Vendor"
                required
                items={vendorItems}
                value={field.state.value}
                onValueChange={field.handleChange}
                onSearchTermChange={setVendorSearch}
                placeholder="Search vendor"
                emptyMessage="No vendors found"
                isLoading={isLoadingVendors}
                isSearching={isFetchingVendors}
                error={fieldError(field.state.meta.errors)}
              />
            )}
          </form.Field>

          <form.Field
            name="vendorInvoiceType"
            validators={{
              onChange: zodOnChange(vendorInvoiceVendorInvoiceTypeSchema),
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name} className="cursor-default">
                  Document type
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={field.state.value}
                    onValueChange={(next) =>
                      field.handleChange(
                        next as "INVOICE" | "REIMBURSEMENT"
                      )
                    }
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INVOICE">Invoice</SelectItem>
                      <SelectItem value="REIMBURSEMENT">
                        Reimbursement
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <form.Field
            name="vendorInvoiceNumber"
            validators={{ onChange: zodOnChange(vendorInvoiceNumberSchema) }}
          >
            {(field) => (
              <TextField
                label="Vendor invoice # / RO #"
                required
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                error={fieldError(field.state.meta.errors)}
                placeholder="e.g. INV-001 / RO-123"
              />
            )}
          </form.Field>

          <form.Field name="vendorInvoiceDate">
            {(field) => (
              <DatePicker
                label="Invoice date"
                value={field.state.value}
                onValueChange={field.handleChange}
                placeholder="Pick invoice date"
                outputFormat="date-only"
              />
            )}
          </form.Field>

          <form.Field name="vendorVessel">
            {(field) => (
              <TextField
                label="Vessel"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            )}
          </form.Field>

          <form.Field name="paymentDate">
            {(field) => (
              <DatePicker
                label="Payment date"
                value={field.state.value}
                onValueChange={field.handleChange}
                placeholder="Pick payment date"
                outputFormat="date-only"
                description="Optional — set when this invoice was paid"
              />
            )}
          </form.Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateVendorInvoice.isPending}>
              {updateVendorInvoice.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useForm } from "@tanstack/react-form"

import type { Vendor } from "@/app/dashboard/vendors/columns"
import { ShipmentTypeField } from "@/components/forms/shipment-type-field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TextField } from "@/components/ui/text-field"
import { usePermissions } from "@/hooks/use-permissions"
import { useCreateVendor } from "@/hooks/use-vendors"
import { fieldError } from "@/lib/form-field"
import {
  vendorCodeSchema,
  vendorNameSchema,
  vendorShipmentTypesSchema,
} from "@/lib/schemas/vendor"
import type { ShipmentType } from "@/lib/permissions"
import { zodOnChange } from "@/lib/zod-form"

export function QuickAddVendorDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (vendor: Vendor) => void
}) {
  const createVendor = useCreateVendor()
  const { can } = usePermissions()
  const canCreate = can("VENDOR", "create")

  const form = useForm({
    defaultValues: {
      vendorCode: "",
      vendorName: "",
      shipmentTypes: [] as ShipmentType[],
      npwp: "",
    },
    onSubmit: async ({ value }) => {
      createVendor.mutate(
        {
          vendorCode: value.vendorCode,
          vendorName: value.vendorName,
          shipmentTypes: value.shipmentTypes,
          npwp: value.npwp.trim() === "" ? null : value.npwp,
          isActive: true,
        },
        {
          onSuccess: (data) => {
            if (data?.id) {
              onCreated(data)
            }
            onOpenChange(false)
            form.reset()
          },
        }
      )
    },
  })

  if (!canCreate) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) form.reset()
      }}
    >
      <DialogContent
        onInteractOutside={(e) => {
          const target = e.target as Element
          if (target.closest('[data-slot="combobox-content"]')) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Add vendor</DialogTitle>
          <DialogDescription>
            Create a vendor in master data and select it on this shipment.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="vendorCode"
            validators={{ onChange: zodOnChange(vendorCodeSchema) }}
          >
            {(field) => (
              <div className="my-3">
                <TextField
                  label="Vendor Code"
                  required
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={fieldError(field.state.meta.errors)}
                />
              </div>
            )}
          </form.Field>
          <form.Field
            name="vendorName"
            validators={{ onChange: zodOnChange(vendorNameSchema) }}
          >
            {(field) => (
              <div className="my-3">
                <TextField
                  label="Vendor Name"
                  required
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={fieldError(field.state.meta.errors)}
                />
              </div>
            )}
          </form.Field>
          <form.Field
            name="shipmentTypes"
            validators={{ onChange: zodOnChange(vendorShipmentTypesSchema) }}
          >
            {(field) => (
              <div className="my-3">
                <ShipmentTypeField
                  id={field.name}
                  value={field.state.value ?? []}
                  onValueChange={(nextValue) => field.handleChange(nextValue)}
                  error={fieldError(field.state.meta.errors)}
                  required
                />
              </div>
            )}
          </form.Field>
          <form.Field name="npwp">
            {(field) => (
              <div className="my-3">
                <TextField
                  label="NPWP"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  description="Optional tax identification number."
                />
              </div>
            )}
          </form.Field>
          <DialogFooter>
            <Button type="submit" disabled={createVendor.isPending}>
              {createVendor.isPending ? "Creating..." : "Create vendor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

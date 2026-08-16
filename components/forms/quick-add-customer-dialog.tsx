"use client"

import { useForm } from "@tanstack/react-form"

import type { Customer } from "@/app/dashboard/customers/columns"
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
import { useCreateCustomer } from "@/hooks/use-customers"
import { usePermissions } from "@/hooks/use-permissions"
import { fieldError } from "@/lib/form-field"
import {
  customerCodeSchema,
  customerNameSchema,
  customerShipmentTypesSchema,
} from "@/lib/schemas/customer"
import type { ShipmentType } from "@/lib/permissions"
import { zodOnChange } from "@/lib/zod-form"

export function QuickAddCustomerDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (customer: Customer) => void
}) {
  const createCustomer = useCreateCustomer()
  const { can } = usePermissions()
  const canCreate = can("CUSTOMER", "create")

  const form = useForm({
    defaultValues: {
      customerCode: "",
      customerName: "",
      shipmentTypes: [] as ShipmentType[],
      address: "",
      npwp: "",
    },
    onSubmit: async ({ value }) => {
      createCustomer.mutate(
        {
          customerCode: value.customerCode,
          customerName: value.customerName,
          shipmentTypes: value.shipmentTypes,
          address: value.address,
          npwp: value.npwp,
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
          <DialogTitle>Add customer</DialogTitle>
          <DialogDescription>
            Create a customer in master data and select it on this shipment.
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
            name="customerCode"
            validators={{ onChange: zodOnChange(customerCodeSchema) }}
          >
            {(field) => (
              <div className="my-3">
                <TextField
                  label="Customer Code"
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
            name="customerName"
            validators={{ onChange: zodOnChange(customerNameSchema) }}
          >
            {(field) => (
              <div className="my-3">
                <TextField
                  label="Customer Name"
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
            validators={{ onChange: zodOnChange(customerShipmentTypesSchema) }}
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
          <form.Field name="address">
            {(field) => (
              <div className="my-3">
                <TextField
                  label="Address"
                  multiline
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  description="Optional billing or office address."
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
            <Button type="submit" disabled={createCustomer.isPending}>
              {createCustomer.isPending ? "Creating..." : "Create customer"}
            </Button>
          </DialogFooter>
        </form>
        </DialogContent>
      </Dialog>
  )
}

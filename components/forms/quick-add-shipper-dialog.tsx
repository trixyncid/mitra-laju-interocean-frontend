"use client"

import { useForm } from "@tanstack/react-form"

import { CountryCombobox } from "@/components/country-combobox"
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
import { useCreateCustomerShipper } from "@/hooks/use-customers"
import { usePermissions } from "@/hooks/use-permissions"
import { fieldError } from "@/lib/form-field"
import { shipperNameSchema } from "@/lib/schemas/shipper"
import { zodOnChange } from "@/lib/zod-form"
import type { CustomerShipperOption } from "@/services/customers.service"

export function QuickAddShipperDialog({
  open,
  onOpenChange,
  customerId,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  onCreated: (shipper: CustomerShipperOption) => void
}) {
  const createShipper = useCreateCustomerShipper()
  const { can } = usePermissions()

  const form = useForm({
    defaultValues: {
      name: "",
      phoneNumber: "",
      country: "",
    },
    onSubmit: async ({ value }) => {
      createShipper.mutate(
        {
          customerId,
          shipper: {
            name: value.name,
            phoneNumber: value.phoneNumber.trim() === "" ? null : value.phoneNumber,
            country: value.country.trim() === "" ? null : value.country,
            isActive: true,
          },
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

  if (!can("CUSTOMER", "create")) return null

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
          <DialogTitle>Add shipper</DialogTitle>
          <DialogDescription>
            Create a shipper for the selected customer and use it on this
            shipment.
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
            name="name"
            validators={{ onChange: zodOnChange(shipperNameSchema) }}
          >
            {(field) => (
              <div className="my-3">
                <TextField
                  label="Name"
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
          <form.Field name="phoneNumber">
            {(field) => (
              <div className="my-3">
                <TextField
                  label="Phone Number"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  description="Optional contact number."
                />
              </div>
            )}
          </form.Field>
          <form.Field name="country">
            {(field) => (
              <div className="my-3">
                <CountryCombobox
                  id={field.name}
                  value={field.state.value}
                  onValueChange={(nextValue) => field.handleChange(nextValue)}
                  description="Optional shipper country or region."
                  placeholder="Search country..."
                />
              </div>
            )}
          </form.Field>
          <DialogFooter>
            <Button type="submit" disabled={createShipper.isPending}>
              {createShipper.isPending ? "Creating..." : "Create shipper"}
            </Button>
          </DialogFooter>
        </form>
        </DialogContent>
      </Dialog>
  )
}

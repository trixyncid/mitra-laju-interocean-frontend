"use client"

import { useForm } from "@tanstack/react-form"

import type { Vessel } from "@/app/dashboard/vessels/columns"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
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
import { useCreateVessel } from "@/hooks/use-vessels"
import { fieldError } from "@/lib/form-field"
import { vesselNameSchema, voyageNumberSchema } from "@/lib/schemas/vessel"
import { zodOnChange } from "@/lib/zod-form"

export function QuickAddVesselDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (vessel: Vessel) => void
}) {
  const createVessel = useCreateVessel()
  const { can } = usePermissions()

  const form = useForm({
    defaultValues: {
      vesselName: "",
      voyageNumber: "",
      etd: "",
      closingReefer: "",
    },
    onSubmit: async ({ value }) => {
      createVessel.mutate(
        {
          vesselName: value.vesselName,
          voyageNumber: value.voyageNumber,
          etd: value.etd === "" ? null : value.etd,
          closingReefer: value.closingReefer === "" ? null : value.closingReefer,
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

  if (!can("VESSEL", "create")) return null

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
          if (
            target.closest('[data-slot="combobox-content"]') ||
            target.closest('[data-slot="popover-content"]')
          ) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Add vessel</DialogTitle>
          <DialogDescription>
            Create a vessel in master data and select it on this shipment.
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
            name="vesselName"
            validators={{ onChange: zodOnChange(vesselNameSchema) }}
          >
            {(field) => (
              <div className="my-3">
                <TextField
                  label="Vessel Name"
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
            name="voyageNumber"
            validators={{ onChange: zodOnChange(voyageNumberSchema) }}
          >
            {(field) => (
              <div className="my-3">
                <TextField
                  label="Voyage"
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
          <form.Field name="etd">
            {(field) => (
              <div className="my-3">
                <DatePicker
                  label="ETD"
                  id={field.name}
                  value={field.state.value}
                  onValueChange={(nextValue) => field.handleChange(nextValue)}
                  error={fieldError(field.state.meta.errors)}
                  placeholder="Pick ETD"
                />
              </div>
            )}
          </form.Field>
          <form.Field name="closingReefer">
            {(field) => (
              <div className="my-3">
                <DatePicker
                  label="Closing Reefer"
                  id={field.name}
                  value={field.state.value}
                  onValueChange={(nextValue) => field.handleChange(nextValue)}
                  error={fieldError(field.state.meta.errors)}
                  placeholder="Pick closing reefer date"
                />
              </div>
            )}
          </form.Field>
          <DialogFooter>
            <Button type="submit" disabled={createVessel.isPending}>
              {createVessel.isPending ? "Creating..." : "Create vessel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

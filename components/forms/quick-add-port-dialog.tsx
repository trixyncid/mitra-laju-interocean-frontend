"use client"

import { useForm } from "@tanstack/react-form"

import type { Port } from "@/app/dashboard/ports/columns"
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
import { useCreatePort } from "@/hooks/use-ports"
import { usePermissions } from "@/hooks/use-permissions"
import { fieldError } from "@/lib/form-field"
import { portCountrySchema, portNameSchema } from "@/lib/schemas/port"
import { zodOnChange } from "@/lib/zod-form"

export function QuickAddPortDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (port: Port) => void
}) {
  const createPort = useCreatePort()
  const { can } = usePermissions()

  const form = useForm({
    defaultValues: {
      portName: "",
      portCountry: "",
    },
    onSubmit: async ({ value }) => {
      createPort.mutate(
        {
          portName: value.portName,
          portCountry: value.portCountry,
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

  if (!can("PORT", "create")) return null

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
          <DialogTitle>Add port</DialogTitle>
          <DialogDescription>
            Create a port in master data and select it on this shipment.
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
            name="portName"
            validators={{ onChange: zodOnChange(portNameSchema) }}
          >
            {(field) => (
              <div className="my-3">
                <TextField
                  label="Port Name"
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
            name="portCountry"
            validators={{ onChange: zodOnChange(portCountrySchema) }}
          >
            {(field) => (
              <div className="my-3">
                <CountryCombobox
                  id={field.name}
                  value={field.state.value}
                  onValueChange={(nextValue) => field.handleChange(nextValue)}
                  error={fieldError(field.state.meta.errors)}
                  required
                  placeholder="Search country..."
                />
              </div>
            )}
          </form.Field>
          <DialogFooter>
            <Button type="submit" disabled={createPort.isPending}>
              {createPort.isPending ? "Creating..." : "Create port"}
            </Button>
          </DialogFooter>
        </form>
        </DialogContent>
      </Dialog>
  )
}

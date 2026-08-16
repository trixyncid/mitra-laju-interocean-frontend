"use client"

import { useForm } from "@tanstack/react-form"
import { useRouter } from "next/navigation"

import type { Vendor } from "@/app/dashboard/vendors/columns"
import { ActiveStatusField } from "@/components/forms/active-status-field"
import { ShipmentTypeField } from "@/components/forms/shipment-type-field"
import { Button } from "@/components/ui/button"
import { TextField } from "@/components/ui/text-field"
import { useCreateVendor, useUpdateVendor } from "@/hooks/use-vendors"
import { fieldError } from "@/lib/form-field"
import {
  vendorCodeSchema,
  vendorNameSchema,
  vendorShipmentTypesSchema,
} from "@/lib/schemas/vendor"
import { sameShipmentTypes } from "@/lib/shipment-types"
import { zodOnChange } from "@/lib/zod-form"
import { toast } from "sonner"

export default function VendorForm({
  mode,
  vendor,
}: {
  mode: "edit" | "create"
  vendor?: Vendor
}) {
  const router = useRouter()
  const createVendor = useCreateVendor()
  const updateVendor = useUpdateVendor()

  const form = useForm({
    defaultValues: {
      id: vendor?.id ?? "",
      vendorCode: vendor?.vendorCode ?? "",
      vendorName: vendor?.vendorName ?? "",
      npwp: vendor?.npwp ?? "",
      shipmentTypes: vendor?.shipmentTypes ?? [],
      isActive: vendor?.isActive ?? true,
    },
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        createVendor.mutate(
          {
            vendorName: value.vendorName,
            vendorCode: value.vendorCode,
            npwp: value.npwp,
            shipmentTypes: value.shipmentTypes,
            isActive: value.isActive,
          },
          {
            onSuccess: (data) => {
              if (data?.id) {
                router.push(`/dashboard/vendors/${data.id}`)
                return
              }
              router.push("/dashboard/vendors")
            },
          }
        )
        return
      }

      if (!vendor?.id) return

      const next = {
        vendorName: value.vendorName,
        vendorCode: value.vendorCode,
        npwp: value.npwp,
        isActive: value.isActive,
        shipmentTypes: value.shipmentTypes,
      }

      const hasChanges =
        next.vendorName !== vendor.vendorName ||
        next.vendorCode !== vendor.vendorCode ||
        next.npwp !== (vendor.npwp ?? "") ||
        !sameShipmentTypes(value.shipmentTypes, vendor.shipmentTypes) ||
        next.isActive !== vendor.isActive

      if (!hasChanges) {
        toast.info("No changes to save")
        return
      }

      updateVendor.mutate({
        id: vendor.id,
        vendor: next,
      })
    },
  })

  const isPending =
    mode === "create" ? createVendor.isPending : updateVendor.isPending

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-headline-md font-semibold">
          {mode === "create" ? "Vendor details" : "Edit vendor details"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {mode === "create"
            ? "Set up a new vendor with code, name, shipment type, and tax information."
            : "Update vendor profile information and active status."}
        </p>
      </div>

      <form
        className="max-w-md space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <form.Field
          name="vendorCode"
          validators={{
            onChange: zodOnChange(vendorCodeSchema),
          }}
        >
          {(field) => (
            <TextField
              label="Vendor Code"
              required
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={fieldError(field.state.meta.errors)}
            />
          )}
        </form.Field>

        <form.Field
          name="vendorName"
          validators={{
            onChange: zodOnChange(vendorNameSchema),
          }}
        >
          {(field) => (
            <TextField
              label="Vendor Name"
              required
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={fieldError(field.state.meta.errors)}
            />
          )}
        </form.Field>

        <form.Field
          name="shipmentTypes"
          validators={{
            onChange: zodOnChange(vendorShipmentTypesSchema),
          }}
        >
          {(field) => (
            <ShipmentTypeField
              id={field.name}
              value={field.state.value}
              onValueChange={(nextValue) => field.handleChange(nextValue)}
              error={fieldError(field.state.meta.errors)}
              required
            />
          )}
        </form.Field>

        <form.Field name="npwp">
          {(field) => (
            <TextField
              label="NPWP"
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              description="Optional tax identification number."
            />
          )}
        </form.Field>

        {mode === "edit" ? (
          <form.Field name="isActive">
            {(field) => (
              <ActiveStatusField
                id={field.name}
                value={field.state.value === true}
                onChange={(checked) => field.handleChange(checked)}
                description="Inactive vendors stay in history but are hidden from new selections."
              />
            )}
          </form.Field>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {mode === "edit"
              ? isPending
                ? "Saving..."
                : "Save changes"
              : isPending
                ? "Creating..."
                : "Create vendor"}
          </Button>
          {mode === "create" ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/vendors")}
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                form.reset({
                  id: vendor?.id ?? "",
                  vendorCode: vendor?.vendorCode ?? "",
                  vendorName: vendor?.vendorName ?? "",
                  npwp: vendor?.npwp ?? "",
                  shipmentTypes: vendor?.shipmentTypes ?? [],
                  isActive: vendor?.isActive ?? true,
                })
              }
            >
              Reset
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

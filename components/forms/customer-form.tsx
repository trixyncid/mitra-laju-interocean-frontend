"use client"

import { useForm } from "@tanstack/react-form"
import { useRouter } from "next/navigation"

import type { Customer } from "@/app/dashboard/customers/columns"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { TextField } from "@/components/ui/text-field"
import { Switch } from "@/components/ui/switch"
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/use-customers"
import { fieldError } from "@/lib/form-field"
import { customerCodeSchema, customerNameSchema } from "@/lib/schemas/customer"
import { zodOnChange } from "@/lib/zod-form"
import { toast } from "sonner"

export default function CustomerForm({
  mode,
  customer,
}: {
  mode: "edit" | "create"
  customer?: Customer
}) {
  const router = useRouter()
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()

  const form = useForm({
    defaultValues: {
      id: customer?.id ?? "",
      customerCode: customer?.customerCode ?? "",
      customerName: customer?.customerName ?? "",
      npwp: customer?.npwp ?? "",
      isActive: customer?.isActive ?? true,
    },
    onSubmit: async ({ value }) => {
      if (mode === "create") {
        createCustomer.mutate(
          {
            customerName: value.customerName,
            customerCode: value.customerCode,
            npwp: value.npwp,
            isActive: value.isActive,
          },
          {
            onSuccess: (data) => {
              if (data?.id) {
                router.push(`/dashboard/customers/${data.id}`)
                return
              }
              router.push("/dashboard/customers")
            },
          }
        )
        return
      }

      if (!customer?.id) return

      const next = {
        customerName: value.customerName,
        customerCode: value.customerCode,
        npwp: value.npwp,
        isActive: value.isActive,
      }

      const hasChanges =
        next.customerName !== customer.customerName ||
        next.customerCode !== customer.customerCode ||
        next.npwp !== (customer.npwp ?? "") ||
        next.isActive !== customer.isActive

      if (!hasChanges) {
        toast.info("No changes to save")
        return
      }

      updateCustomer.mutate({
        id: customer.id,
        customer: next,
      })
    },
  })

  const isPending =
    mode === "create" ? createCustomer.isPending : updateCustomer.isPending

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-headline-md font-semibold">
          {mode === "create" ? "Customer details" : "Edit customer details"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {mode === "create"
            ? "Set up a new customer with code, name, and tax information."
            : "Update customer profile information and active status."}
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
          name="customerCode"
          validators={{
            onChange: zodOnChange(customerCodeSchema),
          }}
        >
          {(field) => (
            <TextField
              label="Customer Code"
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={fieldError(field.state.meta.errors)}
            />
          )}
        </form.Field>

        <form.Field
          name="customerName"
          validators={{
            onChange: zodOnChange(customerNameSchema),
          }}
        >
          {(field) => (
            <TextField
              label="Customer Name"
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={fieldError(field.state.meta.errors)}
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
              <div className="flex items-center gap-3">
                <Switch
                  id={field.name}
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(checked)}
                />
                <Label htmlFor={field.name}>Active customer</Label>
              </div>
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
                : "Create customer"}
          </Button>
          {mode === "create" ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/customers")}
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                form.reset({
                  id: customer?.id ?? "",
                  customerCode: customer?.customerCode ?? "",
                  customerName: customer?.customerName ?? "",
                  npwp: customer?.npwp ?? "",
                  isActive: customer?.isActive ?? true,
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

"use client"

import { useState, type ReactNode } from "react"
import { useForm } from "@tanstack/react-form"
import { IconPencil } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { NumberField } from "@/components/ui/number-field"
import { fieldError } from "@/lib/form-field"
import {
  costingSellingAmountSchema,
  costingSellingPph23Schema,
  costingSellingVatSchema,
} from "@/lib/schemas/costing"
import { zodOnChange } from "@/lib/zod-form"
import { useUpdateCostingBreakdown } from "@/hooks/use-costings"

type Props = {
  costingId: string
  breakdownId: string
  productDescription: string
  sellingAmount?: number | string | null
  sellingVatPercentage?: number | string | null
  sellingPph23Percentage?: number | string | null
  trigger?: ReactNode
}

function toFormNumber(value: number | string | null | undefined): number | "" {
  if (value === "" || value == null) return 0
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

export default function ShipmentCostingBreakdownTaxForm({
  costingId,
  breakdownId,
  productDescription,
  sellingAmount,
  sellingVatPercentage,
  sellingPph23Percentage,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false)
  const updateBreakdown = useUpdateCostingBreakdown(costingId)

  const form = useForm({
    defaultValues: {
      sellingAmount: toFormNumber(sellingAmount) as number | "",
      sellingVatPercentage: toFormNumber(sellingVatPercentage) as number | "",
      sellingPph23Percentage: toFormNumber(
        sellingPph23Percentage
      ) as number | "",
    },
    onSubmit: async ({ value }) => {
      updateBreakdown.mutate(
        {
          breakdownId,
          breakdown: {
            sellingAmount: Number(value.sellingAmount),
            sellingVatPercentage: Number(value.sellingVatPercentage),
            sellingPph23Percentage: Number(value.sellingPph23Percentage),
          },
        },
        {
          onSuccess: () => {
            setOpen(false)
          },
          onError: (error: Error) => {
            toast.error(error.message)
          },
        }
      )
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          form.reset()
          form.setFieldValue("sellingAmount", toFormNumber(sellingAmount))
          form.setFieldValue(
            "sellingVatPercentage",
            toFormNumber(sellingVatPercentage)
          )
          form.setFieldValue(
            "sellingPph23Percentage",
            toFormNumber(sellingPph23Percentage)
          )
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="icon-sm" variant="outline" aria-label="Edit selling charge">
            <IconPencil />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit customer charge</DialogTitle>
          <DialogDescription>
            Selling amount, VAT, and PPH 23 for this shipment-linked line. Vendor
            invoice tax is edited on the costing.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <p className="mb-3 text-sm font-medium text-foreground">
            {productDescription}
          </p>
          <form.Field
            name="sellingAmount"
            validators={{ onChange: zodOnChange(costingSellingAmountSchema) }}
          >
            {(field) => (
              <div className="my-3">
                <NumberField
                  label="Selling amount (IDR)"
                  required
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(nextValue) => field.handleChange(nextValue)}
                  error={fieldError(field.state.meta.errors)}
                  placeholder="0"
                />
              </div>
            )}
          </form.Field>
          <form.Field
            name="sellingVatPercentage"
            validators={{ onChange: zodOnChange(costingSellingVatSchema) }}
          >
            {(field) => (
              <div className="my-3">
                <NumberField
                  label="Selling VAT (%)"
                  required
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(nextValue) => field.handleChange(nextValue)}
                  error={fieldError(field.state.meta.errors)}
                  useGrouping={false}
                  maximumFractionDigits={2}
                  placeholder="0"
                />
              </div>
            )}
          </form.Field>
          <form.Field
            name="sellingPph23Percentage"
            validators={{ onChange: zodOnChange(costingSellingPph23Schema) }}
          >
            {(field) => (
              <div className="my-3">
                <NumberField
                  label="Selling PPH 23 (%)"
                  required
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(nextValue) => field.handleChange(nextValue)}
                  error={fieldError(field.state.meta.errors)}
                  useGrouping={false}
                  maximumFractionDigits={2}
                  placeholder="0"
                />
              </div>
            )}
          </form.Field>
          <DialogFooter>
            <Button type="submit" disabled={updateBreakdown.isPending}>
              {updateBreakdown.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

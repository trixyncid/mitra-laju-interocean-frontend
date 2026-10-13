"use client"

import { useMemo } from "react"

import { TextField } from "@/components/ui/text-field"
import { NumberField } from "@/components/ui/number-field"
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useContainerLookups } from "@/hooks/use-container-lookups"
import type { VendorInvoiceBreakdownInput } from "@/services/vendor-invoice.service"

export type BreakdownLineValues = {
  productDescription: string
  quantity: number | ""
  price: number | ""
  currencyPrice: number | ""
  vatPercentage: number | ""
  pph23Percentage: number | ""
  containerNumber: string
  containerSizeId: string
  containerTypeId: string
}

type BreakdownLineSource = {
  productDescription?: string | null
  quantity?: number | string | null
  price?: number | string | null
  currencyPrice?: number | string | null
  vatPercentage?: number | string | null
  pph23Percentage?: number | string | null
  containerNumber?: string | null
  containerSizeId?: string | null
  containerTypeId?: string | null
}

/** Parse API Decimal/number without treating "." as a thousands separator. */
function toFormNumber(
  value: number | string | null | undefined,
  fallback: number
): number {
  if (value === "" || value == null) return fallback
  const num = typeof value === "number" ? value : Number(value)
  return Number.isFinite(num) ? num : fallback
}

function toPercentageFormNumber(
  value: number | string | null | undefined,
  fallback: number
): number {
  return Math.round(toFormNumber(value, fallback) * 100) / 100
}

function roundPercentage(value: number | "") {
  return typeof value === "number" ? Math.round(value * 100) / 100 : 0
}

/** Form values for a new line, or for editing an existing one. */
export function breakdownLineValues(source?: BreakdownLineSource): BreakdownLineValues {
  return {
    productDescription: source?.productDescription ?? "",
    quantity: toFormNumber(source?.quantity, 1),
    price:
      source?.price == null || source.price === ""
        ? ""
        : toFormNumber(source.price, 0),
    currencyPrice: toFormNumber(source?.currencyPrice, 1),
    vatPercentage: toPercentageFormNumber(source?.vatPercentage, 0),
    pph23Percentage: toPercentageFormNumber(source?.pph23Percentage, 0),
    containerNumber: source?.containerNumber ?? "",
    containerSizeId: source?.containerSizeId ?? "",
    containerTypeId: source?.containerTypeId ?? "",
  }
}

export function breakdownLinePayload(
  values: BreakdownLineValues
): VendorInvoiceBreakdownInput {
  return {
    productDescription: values.productDescription.trim(),
    quantity: typeof values.quantity === "number" ? values.quantity : 1,
    price: typeof values.price === "number" ? values.price : 0,
    currencyPrice:
      typeof values.currencyPrice === "number" ? values.currencyPrice : 1,
    vatPercentage: roundPercentage(values.vatPercentage),
    pph23Percentage: roundPercentage(values.pph23Percentage),
    containerNumber: values.containerNumber.trim() || null,
    containerSizeId: values.containerSizeId || null,
    containerTypeId: values.containerTypeId || null,
  }
}

/** Charge, amount, tax, and container fields for one vendor invoice line. */
export function BreakdownLineFields({
  values,
  onChange,
  lookupsEnabled,
}: {
  values: BreakdownLineValues
  onChange: (next: BreakdownLineValues) => void
  /** Load container size/type options (usually while the dialog is open). */
  lookupsEnabled: boolean
}) {
  const set = <K extends keyof BreakdownLineValues>(
    key: K,
    value: BreakdownLineValues[K]
  ) => onChange({ ...values, [key]: value })

  const { data: sizesData } = useContainerLookups(
    "size",
    { page: 1, pageSize: 100, status: "all" },
    lookupsEnabled
  )
  const { data: typesData } = useContainerLookups(
    "type",
    { page: 1, pageSize: 100, status: "all" },
    lookupsEnabled
  )

  const sizeOptions = useMemo(
    () =>
      (sizesData?.items ?? []).filter(
        (item) => item.isActive || item.id === values.containerSizeId
      ),
    [sizesData?.items, values.containerSizeId]
  )
  const typeOptions = useMemo(
    () =>
      (typesData?.items ?? []).filter(
        (item) => item.isActive || item.id === values.containerTypeId
      ),
    [typesData?.items, values.containerTypeId]
  )

  return (
    <div className="space-y-4">
      <TextField
        label="Product / charge"
        required
        value={values.productDescription}
        onChange={(event) => set("productDescription", event.target.value)}
        placeholder="e.g. Ocean freight, THC, trucking"
      />

      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField
            label="Quantity"
            required
            value={values.quantity}
            onValueChange={(value) => set("quantity", value)}
            maximumFractionDigits={0}
          />
          <NumberField
            label="Unit price"
            required
            value={values.price}
            onValueChange={(value) => set("price", value)}
          />
          <NumberField
            label="Exchange rate"
            required
            value={values.currencyPrice}
            onValueChange={(value) => set("currencyPrice", value)}
            description="Use 1 if already IDR"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField
            label="VAT %"
            required
            value={values.vatPercentage}
            onValueChange={(value) => set("vatPercentage", value)}
            useGrouping={false}
            maximumFractionDigits={2}
            placeholder="0"
          />
          <NumberField
            label="PPH 23 %"
            required
            value={values.pph23Percentage}
            onValueChange={(value) => set("pph23Percentage", value)}
            useGrouping={false}
            maximumFractionDigits={2}
            placeholder="0"
          />
        </div>
        <FieldDescription>
          VAT and PPH 23 apply to this line’s gross (unit × rate × qty).
        </FieldDescription>
      </div>

      <div className="rounded-md border border-[rgba(var(--mli-tint-rgb),0.55)] bg-[rgba(var(--mli-inset-rgb),0.55)] p-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-foreground">Container details</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Optional — fill these in when this charge belongs to a specific
            container.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            label="Container number"
            value={values.containerNumber}
            onChange={(event) => set("containerNumber", event.target.value)}
            placeholder="e.g. MSKU1234567"
          />

          <Field>
            <FieldLabel htmlFor="breakdown-container-size" className="cursor-default">
              Size
            </FieldLabel>
            <FieldContent>
              <Select
                value={values.containerSizeId || "-"}
                onValueChange={(value) =>
                  set("containerSizeId", value === "-" ? "" : value)
                }
              >
                <SelectTrigger id="breakdown-container-size" className="w-full">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">None</SelectItem>
                  {sizeOptions.map((size) => (
                    <SelectItem key={size.id} value={size.id ?? ""}>
                      {size.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="breakdown-container-type" className="cursor-default">
              Type
            </FieldLabel>
            <FieldContent>
              <Select
                value={values.containerTypeId || "-"}
                onValueChange={(value) =>
                  set("containerTypeId", value === "-" ? "" : value)
                }
              >
                <SelectTrigger id="breakdown-container-type" className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">None</SelectItem>
                  {typeOptions.map((type) => (
                    <SelectItem key={type.id} value={type.id ?? ""}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        </div>
      </div>
    </div>
  )
}

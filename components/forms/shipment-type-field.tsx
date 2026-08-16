"use client"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import type { ShipmentType } from "@/lib/permissions"
import { SHIPMENT_TYPE_OPTIONS } from "@/lib/shipment-types"

export function ShipmentTypeField({
  id,
  value,
  onValueChange,
  error,
  required,
}: {
  id?: string
  value: ShipmentType[]
  onValueChange: (value: ShipmentType[]) => void
  error?: string
  required?: boolean
}) {
  function toggle(type: ShipmentType) {
    onValueChange(
      value.includes(type)
        ? value.filter((item) => item !== type)
        : [...value, type]
    )
  }

  return (
    <Field data-invalid={Boolean(error) || undefined}>
      <FieldLabel htmlFor={id} className="cursor-default" required={required}>
        Shipment Type
      </FieldLabel>
      <FieldContent>
        <div id={id} className="flex flex-wrap gap-4">
          {SHIPMENT_TYPE_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={value.includes(option.value)}
                onCheckedChange={() => toggle(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {error ? (
          <em
            role="alert"
            className="text-xs not-italic text-[var(--mli-on-error-container)]"
          >
            {error}
          </em>
        ) : (
          <FieldDescription>
            Select every shipment type this profile is used for.
          </FieldDescription>
        )}
      </FieldContent>
    </Field>
  )
}

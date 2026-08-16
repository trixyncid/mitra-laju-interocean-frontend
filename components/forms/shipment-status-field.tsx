"use client"

import { FieldDescription } from "@/components/ui/field"
import { FormLabel } from "@/components/ui/form-label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SHIPMENT_STATUS_OPTIONS,
  type ShipmentStatus,
} from "@/lib/shipment-status"

export function ShipmentStatusField({
  id,
  value,
  onValueChange,
  description,
}: {
  id: string
  value: ShipmentStatus
  onValueChange: (status: ShipmentStatus) => void
  description?: string
}) {
  return (
    <div>
      <FormLabel htmlFor={id} className="my-2" required>
        Shipment status
      </FormLabel>
      <Select
        value={value}
        onValueChange={(next) => onValueChange(next as ShipmentStatus)}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Select shipment status" />
        </SelectTrigger>
        <SelectContent>
          {SHIPMENT_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description ? (
        <FieldDescription className="mt-2">{description}</FieldDescription>
      ) : null}
    </div>
  )
}

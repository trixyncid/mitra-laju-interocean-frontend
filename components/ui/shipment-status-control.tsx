"use client"

import { ShipmentLifecycleChip } from "@/components/ui/status-chip"
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

export function ShipmentStatusControl({
  value,
  onValueChange,
  disabled,
  readOnly,
}: {
  value: ShipmentStatus
  onValueChange?: (status: ShipmentStatus) => void
  disabled?: boolean
  readOnly?: boolean
}) {
  if (readOnly || !onValueChange) {
    return <ShipmentLifecycleChip status={value} />
  }

  return (
    <Select
      value={value}
      onValueChange={(next) => onValueChange(next as ShipmentStatus)}
      disabled={disabled}
    >
      <SelectTrigger
        aria-label="Shipment status"
        size="sm"
        className="w-full min-w-[148px]"
      >
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent position="popper" align="start">
        {SHIPMENT_STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

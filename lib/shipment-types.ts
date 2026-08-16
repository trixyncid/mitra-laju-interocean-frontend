import type { ShipmentType } from "@/lib/permissions"

export const SHIPMENT_TYPE_OPTIONS: { value: ShipmentType; label: string }[] = [
  { value: "IMPORT", label: "Import" },
  { value: "EXPORT", label: "Export" },
  { value: "DOMESTIC", label: "Domestic" },
]

export function formatShipmentType(type: string | null | undefined) {
  if (!type) return null
  const match = SHIPMENT_TYPE_OPTIONS.find((option) => option.value === type)
  if (match) return match.label
  return type.charAt(0) + type.slice(1).toLowerCase()
}

export function sameShipmentTypes(
  left: string[] | null | undefined,
  right: string[] | null | undefined
) {
  const a = [...(left ?? [])].sort()
  const b = [...(right ?? [])].sort()
  return a.length === b.length && a.every((value, index) => value === b[index])
}

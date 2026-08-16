export const SHIPMENT_STATUSES = ["DRAFT", "BACKUP", "ONGOING", "FINISHED"] as const

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number]

export const SHIPMENT_STATUS_OPTIONS: { value: ShipmentStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "BACKUP", label: "Backup" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "FINISHED", label: "Finished" },
]

export function formatShipmentStatus(status: string | null | undefined) {
  if (!status) return "—"
  const match = SHIPMENT_STATUS_OPTIONS.find((option) => option.value === status)
  if (match) return match.label
  return status.charAt(0) + status.slice(1).toLowerCase()
}

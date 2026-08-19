import { cn } from "@/lib/utils"
import { formatShipmentType } from "@/lib/shipment-types"
import { chipShipmentType } from "@/lib/design"

export function ShipmentTypeTag({
  type,
  tone = "default",
  className,
}: {
  type: string | null | undefined
  tone?: "default" | "onPrimary"
  className?: string
}) {
  const label = formatShipmentType(type)
  if (!label) return null

  return (
    <span
      className={cn(
        chipShipmentType(type, "px-1.5 py-px text-[10px] font-medium leading-4 tracking-wide"),
        tone === "onPrimary" && "ring-1 ring-white/25",
        className
      )}
    >
      {label}
    </span>
  )
}

export function ShipmentTypeTags({
  types,
  tone = "default",
  className,
}: {
  types?: string[] | null
  tone?: "default" | "onPrimary"
  className?: string
}) {
  if (!types?.length) return null

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1", className)}>
      {types.map((type) => (
        <ShipmentTypeTag key={type} type={type} tone={tone} />
      ))}
    </span>
  )
}

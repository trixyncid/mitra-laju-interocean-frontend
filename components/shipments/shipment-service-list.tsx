import type { ShipmentServiceLine } from "@/app/dashboard/shipments/columns"
import { vendorLabel } from "@/lib/vendor-label"
import { cn } from "@/lib/utils"

/** "Trucking: Truck Co (TRK) · Freight: Freight Co (FRT)" — for one-line summaries. */
export function summarizeServices(lines: ShipmentServiceLine[] | undefined) {
  return (lines ?? [])
    .map((line) => {
      const vendor = vendorLabel(line.vendor)
      return vendor ? `${line.service.serviceName}: ${vendor}` : line.service.serviceName
    })
    .join(" · ")
}

/** Each service on its own row with the vendor it is booked to. */
export function ShipmentServiceList({
  lines,
  className,
}: {
  lines: ShipmentServiceLine[] | undefined
  className?: string
}) {
  if (!lines?.length) return null
  return (
    <ul className={cn("divide-y divide-border/70 rounded-lg bg-muted/50", className)}>
      {lines.map((line, index) => {
        const vendor = vendorLabel(line.vendor)
        return (
          <li key={line.id ?? `${line.serviceId}-${index}`} className="flex items-baseline justify-between gap-3 px-3 py-2">
            <span className="shrink-0 text-xs font-medium text-muted-foreground">{line.service.serviceName}</span>
            <span className={cn("min-w-0 truncate text-right text-sm", vendor ? "font-medium text-foreground" : "text-muted-foreground")} title={vendor ?? undefined}>
              {vendor ?? "No vendor yet"}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

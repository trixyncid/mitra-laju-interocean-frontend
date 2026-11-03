import { IconShip, IconTruck, IconUser } from "@tabler/icons-react"

import { ShipmentTypeTag } from "@/components/ui/shipment-type-tag"
import { cn, localDate } from "@/lib/utils"

export type TicketPort = { name: string; country?: string } | null

export type BookingTicketData = {
  customer: string | null
  shipper: string | null
  shipmentType: string | null
  status: string
  origin: TicketPort
  destination: TicketPort
  vessel: string | null
  eta: string | null
  bookingNumber: string | null
  blNumber: string | null
  /** "Trucking: Truck Co (TRK)" — one entry per service line. */
  services: string[]
  stuffing: string | null
}

/** "Tanjung Priok, Indonesia" -> { name, country } */
export function splitPortLabel(label: string | null | undefined): TicketPort {
  if (!label) return null
  const at = label.lastIndexOf(", ")
  return at === -1 ? { name: label } : { name: label.slice(0, at), country: label.slice(at + 2) }
}

function Empty({ children }: { children: React.ReactNode }) {
  return <span className="font-normal text-muted-foreground/70">{children}</span>
}

function PortEnd({ port, label, align }: { port: TicketPort; label: string; align: "start" | "end" }) {
  return (
    <div className={cn("min-w-0", align === "end" && "text-right")}>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 line-clamp-2 text-[15px] leading-tight font-semibold break-words text-foreground">
        {port ? port.name : <Empty>Not set</Empty>}
      </p>
      <p className="truncate text-xs text-muted-foreground">{port?.country ?? " "}</p>
    </div>
  )
}

function Item({ label, value, empty = "—", wide }: { label: string; value: string | null; empty?: string; wide?: boolean }) {
  return (
    <div className={cn("min-w-0", wide && "col-span-2")}>
      <dt className="text-[11px] font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium text-foreground">
        {value ? value : <Empty>{empty}</Empty>}
      </dd>
    </div>
  )
}

/**
 * A boarding-pass style summary of the shipment being created.
 * It only shows what the form already holds, so it updates as people type.
 */
export function BookingTicket({ data, className }: { data: BookingTicketData; className?: string }) {
  const routeReady = Boolean(data.origin && data.destination)
  return (
    <article
      aria-label="Booking summary"
      className={cn("overflow-hidden rounded-2xl surface shadow-elev-2", className)}
    >
      <div className="brand-fill relative overflow-hidden px-5 pt-4 pb-5 text-primary-foreground">
        <IconShip aria-hidden className="absolute -right-4 -bottom-6 size-28 opacity-10" stroke={1.25} />
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-primary-foreground/70 uppercase">
            Booking card
          </p>
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-white/20">
            {data.status}
          </span>
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-primary-foreground/70">
          <IconUser className="size-3.5" /> Customer
        </p>
        <p className="mt-0.5 truncate text-lg leading-snug font-semibold">
          {data.customer ?? <span className="font-normal text-primary-foreground/60">Choose a customer</span>}
        </p>
        <p className="truncate text-sm text-primary-foreground/75">
          {data.shipper ? `Shipper: ${data.shipper}` : "No shipper yet"}
        </p>
      </div>

      <div className="px-5 pt-5 pb-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <PortEnd port={data.origin} label="From" align="start" />
          <div aria-hidden className="relative flex w-12 items-center justify-center sm:w-16">
            <span
              className={cn(
                "absolute inset-x-0 top-1/2 border-t-2 border-dashed",
                routeReady ? "border-primary/60" : "border-border"
              )}
            />
            <span
              className={cn(
                "relative flex size-8 items-center justify-center rounded-full ring-4 ring-card",
                routeReady ? "brand-fill text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              <IconShip className="size-4" />
            </span>
          </div>
          <PortEnd port={data.destination} label="To" align="end" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {data.shipmentType ? (
            <ShipmentTypeTag type={data.shipmentType} className="px-2 py-0.5 text-[11px]" />
          ) : (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">Type not set</span>
          )}
          {data.eta ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-foreground">
              Arrives {localDate(data.eta)}
            </span>
          ) : null}
        </div>
      </div>

      {/* Tear line with cut-outs, like a real ticket. */}
      <div aria-hidden className="relative h-0">
        <span className="absolute inset-x-5 border-t-2 border-dashed border-border" />
        <span className="absolute -top-2.5 -left-2.5 size-5 rounded-full bg-background shadow-[inset_-1px_0_0_rgba(0,0,0,0.04)]" />
        <span className="absolute -top-2.5 -right-2.5 size-5 rounded-full bg-background" />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 pt-5 pb-5">
        <Item label="Vessel / voyage" value={data.vessel} empty="Choose a vessel" wide />
        <Item label="Booking no." value={data.bookingNumber} />
        <Item label="BL no." value={data.blNumber} />
        <Item label="Stuffing at" value={data.stuffing} wide />
      </dl>

      <div className="flex items-center gap-2 border-t border-border/70 bg-[rgba(var(--mli-inset-rgb),0.6)] px-5 py-3 text-xs text-muted-foreground">
        <IconTruck className="size-4 shrink-0" />
        <span className="min-w-0 truncate">
          {data.services.length ? data.services.join(" · ") : "No services yet"}
        </span>
      </div>
    </article>
  )
}

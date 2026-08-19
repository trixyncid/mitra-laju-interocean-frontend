"use client"

import Link from "next/link"
import { useState, type ReactNode } from "react"
import { IconArrowRight } from "@tabler/icons-react"

import type { VoyageStatus } from "@/app/dashboard/dashboard-types"
import { ContainerSummaryTags } from "@/components/ui/container-summary-tags"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ShipmentTypeTag } from "@/components/ui/shipment-type-tag"
import { WarningChip } from "@/components/ui/status-chip"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useDashboardShipmentsByVoyage } from "@/hooks/use-dashboard-shipments-by-voyage"
import { usePermissions } from "@/hooks/use-permissions"
import {
  brandLink,
  brandText,
  glassPanel,
  secondaryText,
  tableCellClass,
  tableHeaderCell,
  tableHeaderRow,
  tableRowClass,
  tableShell,
} from "@/lib/design"
import { cn, localDate } from "@/lib/utils"

const VOYAGE_STATUS_OPTIONS: {
  value: VoyageStatus
  label: string
  description: string
  empty: string
}[] = [
  {
    value: "draft",
    label: "Draft",
    description: "Shipments marked draft and linked to a vessel voyage.",
    empty: "No draft vessel voyages found.",
  },
  {
    value: "backup",
    label: "Backup",
    description: "Shipments marked backup and linked to a vessel voyage.",
    empty: "No backup vessel voyages found.",
  },
  {
    value: "ongoing",
    label: "Ongoing",
    description: "Shipments marked ongoing and linked to active voyage operations.",
    empty: "No ongoing vessel voyages right now.",
  },
]

function formatDateTime(value: string | null) {
  if (!value) return "—"
  return localDate(value)
}

function displayValue(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : "—"
}

function LabeledStack({
  items,
  labelClassName,
}: {
  items: { label: string; value: string | null | undefined }[]
  labelClassName?: string
}) {
  return (
    <div className="flex min-w-0 max-w-[16rem] flex-col gap-0.5">
      {items.map((item) => (
        <div key={item.label} className="flex min-w-0 items-baseline gap-1.5">
          <span
            className={cn(
              "w-14 shrink-0 text-[10px] font-medium tracking-wide text-muted-foreground uppercase",
              labelClassName
            )}
          >
            {item.label}
          </span>
          <span className={cn(secondaryText, "truncate")} title={displayValue(item.value)}>
            {displayValue(item.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

function RouteCell({
  departure,
  destination,
}: {
  departure: string | null
  destination: string | null
}) {
  if (!departure && !destination) {
    return <WarningChip>Unavailable</WarningChip>
  }

  return (
    <span className={cn(secondaryText, "flex flex-row items-center gap-x-1")}>
      {departure ?? "—"}
      <IconArrowRight className="size-4 shrink-0" />
      {destination ?? "—"}
    </span>
  )
}

function CustomerCell({
  name,
  code,
  shipper,
  type,
}: {
  name: string
  code: string
  shipper: string | null
  type: string
}) {
  const customer = name ? `${name} (${code})` : "—"

  return (
    <div className="flex min-w-0 max-w-[18rem] flex-col gap-0.5">
      <span className={cn(secondaryText, "inline-flex min-w-0 items-center gap-1.5")}>
        <span className="truncate">{customer}</span>
        {type ? (
          <ShipmentTypeTag type={type} className="shrink-0 px-2 py-0.5 text-xs" />
        ) : null}
      </span>
      <span className="truncate text-xs text-muted-foreground">
        {displayValue(shipper)}
      </span>
    </div>
  )
}

function OrderCell({
  id,
  orderNumber,
  canReadShipments,
}: {
  id: string
  orderNumber: string
  canReadShipments: boolean
}) {
  const label: ReactNode = canReadShipments ? (
    <Link href={`/dashboard/shipments/${id}`} className={brandLink}>
      {orderNumber}
    </Link>
  ) : (
    orderNumber
  )

  return <div className="font-semibold text-foreground">{label}</div>
}

export function DashboardShipmentsByVoyage() {
  const [voyageStatus, setVoyageStatus] = useState<VoyageStatus>("ongoing")
  const { canRead } = usePermissions()
  const canReadShipments = canRead("shipments")
  const { data, isLoading, error } = useDashboardShipmentsByVoyage(voyageStatus)
  const selectedStatus = VOYAGE_STATUS_OPTIONS.find(
    (option) => option.value === voyageStatus
  )

  return (
    <Card
      className={cn(
        glassPanel,
        "relative min-w-0 gap-0 overflow-hidden p-5 shadow-none lg:p-7"
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.65)] to-transparent"
      />
      <CardHeader className="gap-4 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="mb-1 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
            Operations
          </p>
          <CardTitle className="text-lg">Shipments by Vessel Voyage</CardTitle>
          <CardDescription>{selectedStatus?.description}</CardDescription>
        </div>
        <ToggleGroup
          type="single"
          value={voyageStatus}
          onValueChange={(value) => {
            if (value === "draft" || value === "backup" || value === "ongoing") {
              setVoyageStatus(value)
            }
          }}
          variant="outline"
          size="sm"
          className="gap-0.5 rounded-md border border-[rgba(214,227,255,0.55)] bg-[rgba(214,227,255,0.35)] p-0.5 shadow-none"
        >
          {VOYAGE_STATUS_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              aria-label={`Show ${option.label.toLowerCase()} voyages`}
              className="rounded-md border-0 px-4 text-muted-foreground shadow-none hover:bg-[rgba(247,249,251,0.65)] hover:text-foreground data-[spacing=0]:rounded-md data-[spacing=0]:first:rounded-md data-[spacing=0]:last:rounded-md data-[state=on]:bg-[var(--mli-primary-container)] data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-[var(--mli-primary-container)] data-[state=on]:hover:text-primary-foreground"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-lg bg-[rgba(214,227,255,0.35)]" />
            ))}
          </div>
        ) : error ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {error.message || "Unable to load voyage shipments."}
          </p>
        ) : !data?.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {selectedStatus?.empty}
          </p>
        ) : (
          data.map((voyage) => (
            <div
              key={voyage.vesselId}
              className={cn(tableShell, "overflow-x-auto rounded-lg")}
            >
              <div className="flex flex-col gap-1 border-b border-[rgba(214,227,255,0.35)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className={cn("font-semibold", brandText)}>
                    {voyage.vesselName} / {voyage.voyageNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ETD {formatDateTime(voyage.etd)}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {voyage.shipments.length} shipment
                  {voyage.shipments.length === 1 ? "" : "s"}
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className={tableHeaderRow}>
                    <TableHead className={tableHeaderCell}>Order Number</TableHead>
                    <TableHead className={tableHeaderCell}>Customer</TableHead>
                    <TableHead className={tableHeaderCell}>Route</TableHead>
                    <TableHead className={tableHeaderCell}>Booking / BL</TableHead>
                    <TableHead className={tableHeaderCell}>Book To</TableHead>
                    <TableHead className={cn(tableHeaderCell, "min-w-[10rem]")}>
                      Remarks
                    </TableHead>
                    <TableHead className={cn(tableHeaderCell, "min-w-[12rem]")}>
                      Containers
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voyage.shipments.map((shipment) => (
                    <TableRow key={shipment.id} className={tableRowClass}>
                      <TableCell className={tableCellClass}>
                        <OrderCell
                          id={shipment.id}
                          orderNumber={shipment.orderNumber}
                          canReadShipments={canReadShipments}
                        />
                      </TableCell>
                      <TableCell className={tableCellClass}>
                        <CustomerCell
                          name={shipment.customerName}
                          code={shipment.customerCode}
                          shipper={shipment.customerShipper}
                          type={shipment.shipmentType}
                        />
                      </TableCell>
                      <TableCell className={tableCellClass}>
                        <RouteCell
                          departure={shipment.portDeparture}
                          destination={shipment.portDestination}
                        />
                      </TableCell>
                      <TableCell className={tableCellClass}>
                        <LabeledStack
                          items={[
                            { label: "Booking", value: shipment.bookingNumber },
                            { label: "BL", value: shipment.blNumber },
                          ]}
                        />
                      </TableCell>
                      <TableCell className={tableCellClass}>
                        <LabeledStack
                          labelClassName="w-16"
                          items={[
                            { label: "Trucking", value: shipment.truckingBookTo },
                            { label: "Freight", value: shipment.freightBookTo },
                          ]}
                        />
                      </TableCell>
                      <TableCell
                        className={cn(
                          tableCellClass,
                          "min-w-[10rem] max-w-[16rem] whitespace-normal"
                        )}
                      >
                        {shipment.remarks?.trim() ? (
                          <span
                            className={cn(secondaryText, "line-clamp-2")}
                            title={shipment.remarks}
                          >
                            {shipment.remarks}
                          </span>
                        ) : (
                          <span className={secondaryText}>—</span>
                        )}
                      </TableCell>
                      <TableCell
                        className={cn(
                          tableCellClass,
                          "min-w-[12rem] max-w-[18rem] whitespace-normal"
                        )}
                      >
                        <ContainerSummaryTags containers={shipment.containers ?? []} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

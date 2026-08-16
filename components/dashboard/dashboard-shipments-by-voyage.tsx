"use client"

import Link from "next/link"
import { useState } from "react"

import type { VoyageStatus } from "@/app/dashboard/dashboard-types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
              className={cn(tableShell, "rounded-lg")}
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
                    <TableHead className={tableHeaderCell}>Order #</TableHead>
                    <TableHead className={tableHeaderCell}>Customer</TableHead>
                    <TableHead className={tableHeaderCell}>Type</TableHead>
                    <TableHead className={tableHeaderCell}>POL</TableHead>
                    <TableHead className={tableHeaderCell}>POD</TableHead>
                    <TableHead className={tableHeaderCell}>ETA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voyage.shipments.map((shipment) => (
                    <TableRow key={shipment.id} className={tableRowClass}>
                      <TableCell className={tableCellClass}>
                        {canReadShipments ? (
                          <Link
                            href={`/dashboard/shipments/${shipment.id}`}
                            className={brandLink}
                          >
                            {shipment.orderNumber}
                          </Link>
                        ) : (
                          shipment.orderNumber
                        )}
                      </TableCell>
                      <TableCell className={tableCellClass}>
                        <div>{shipment.customerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {shipment.customerCode}
                        </div>
                      </TableCell>
                      <TableCell className={tableCellClass}>
                        {shipment.shipmentType}
                      </TableCell>
                      <TableCell className={tableCellClass}>
                        {shipment.portDeparture ?? "—"}
                      </TableCell>
                      <TableCell className={tableCellClass}>
                        {shipment.portDestination ?? "—"}
                      </TableCell>
                      <TableCell className={tableCellClass}>
                        {formatDateTime(shipment.eta)}
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

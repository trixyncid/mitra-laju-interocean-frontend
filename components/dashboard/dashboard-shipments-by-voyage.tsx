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
import { tableCellClass, tableHeaderCell, tableHeaderRow, tableRowClass } from "@/lib/design"
import { localDate } from "@/lib/utils"

function formatDateTime(value: string | null) {
  if (!value) return "—"
  return localDate(value)
}

export function DashboardShipmentsByVoyage() {
  const [voyageStatus, setVoyageStatus] = useState<VoyageStatus>("ongoing")
  const { canRead } = usePermissions()
  const canReadShipments = canRead("shipments")
  const { data, isLoading, error } = useDashboardShipmentsByVoyage(voyageStatus)

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg">Shipments by Vessel Voyage</CardTitle>
          <CardDescription>
            {voyageStatus === "ongoing"
              ? "Active voyages with ETA today or later, or no ETA set yet."
              : "Completed voyages with ETA before today."}
          </CardDescription>
        </div>
        <ToggleGroup
          type="single"
          value={voyageStatus}
          onValueChange={(value) => {
            if (value === "ongoing" || value === "done") {
              setVoyageStatus(value)
            }
          }}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="ongoing" aria-label="Show ongoing voyages">
            Ongoing
          </ToggleGroupItem>
          <ToggleGroupItem value="done" aria-label="Show completed voyages">
            Done
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {error.message || "Unable to load voyage shipments."}
          </p>
        ) : !data?.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {voyageStatus === "ongoing"
              ? "No ongoing vessel voyages right now."
              : "No completed vessel voyages found."}
          </p>
        ) : (
          data.map((voyage) => (
            <div key={voyage.vesselId} className="rounded-2xl border bg-card/50">
              <div className="flex flex-col gap-1 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">
                    {voyage.vesselName} / {voyage.voyageNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ETD {formatDateTime(voyage.etd)}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {voyage.shipments.length} shipment{voyage.shipments.length === 1 ? "" : "s"}
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
                            className="font-medium hover:underline"
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
                      <TableCell className={tableCellClass}>{shipment.shipmentType}</TableCell>
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

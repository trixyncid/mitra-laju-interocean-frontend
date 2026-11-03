"use client"

import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { shipmentFilterParams } from "@/components/shipments/shipment-filter-provider"
import { TableExportButton } from "@/components/table-export-button"
import { shipmentsService } from "@/services/shipments.service"

type LifecycleFilter = "all" | "DRAFT" | "BACKUP" | "ONGOING" | "FINISHED"

/** Exports every shipment matching the applied filters to Excel. */
export function ShipmentExportButton({
  applied,
  totalRows,
  compact = false,
}: {
  applied: AppliedTableFilters
  totalRows: number
  /** Icon-only button for tight toolbars. */
  compact?: boolean
}) {
  return (
    <TableExportButton
      module="SHIPMENT"
      noun="shipments"
      totalRows={totalRows}
      compact={compact}
      onExport={() => {
        const { search, columns } = shipmentFilterParams(applied)
        // A single ticked status still names the file, e.g. shipments-ongoing-….
        const statuses = columns.status ?? []
        return shipmentsService.exportExcel({
          search,
          columns,
          lifecycleStatus: statuses.length === 1 ? (statuses[0] as LifecycleFilter) : "all",
        })
      }}
    />
  )
}

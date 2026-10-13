"use client"

import { useState } from "react"
import { IconFileSpreadsheet } from "@tabler/icons-react"
import { toast } from "sonner"

import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { shipmentFilterParams } from "@/components/shipments/shipment-filter-provider"
import { Button } from "@/components/ui/button"
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
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    if (isExporting) return
    if (totalRows === 0) {
      toast.error("No shipments to export for the current filters.")
      return
    }

    setIsExporting(true)
    try {
      const { search, columns } = shipmentFilterParams(applied)
      // A single ticked status still names the file, e.g. shipments-ongoing-….
      const statuses = columns.status ?? []
      const { rowCount } = await shipmentsService.exportExcel({
        search,
        columns,
        lifecycleStatus: statuses.length === 1 ? (statuses[0] as LifecycleFilter) : "all",
      })
      toast.success(`Exported ${rowCount ?? totalRows} shipments.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export shipments.")
    } finally {
      setIsExporting(false)
    }
  }

  if (compact) {
    const label = isExporting ? "Exporting…" : `Export ${totalRows} shipments to Excel`
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isExporting}
        onClick={() => void handleExport()}
        aria-label={label}
        title={label}
      >
        <IconFileSpreadsheet className={isExporting ? "animate-pulse" : undefined} />
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isExporting}
      onClick={() => void handleExport()}
    >
      <IconFileSpreadsheet className="size-4" />
      {isExporting
        ? "Exporting..."
        : totalRows > 0
          ? `Export Excel (${totalRows})`
          : "Export Excel"}
    </Button>
  )
}

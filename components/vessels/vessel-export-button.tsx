"use client"

import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { TableExportButton } from "@/components/table-export-button"
import { vesselFilterParams } from "@/components/vessels/vessel-filter-provider"
import { vesselsService } from "@/services/vessels.service"

/** Exports every vessel matching the search and column filters to Excel. */
export function VesselExportButton({
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
      module="VESSEL"
      noun="vessels"
      totalRows={totalRows}
      compact={compact}
      onExport={() => vesselsService.exportExcel(vesselFilterParams(applied))}
    />
  )
}

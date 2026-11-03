"use client"

import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { TableExportButton } from "@/components/table-export-button"
import { vendorFilterParams } from "@/components/vendors/vendor-filter-provider"
import { vendorsService } from "@/services/vendors.service"

/** Exports every vendor matching the search, pills and column filters to Excel. */
export function VendorExportButton({
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
      module="VENDOR"
      noun="vendors"
      totalRows={totalRows}
      compact={compact}
      onExport={() => vendorsService.exportExcel(vendorFilterParams(applied))}
    />
  )
}

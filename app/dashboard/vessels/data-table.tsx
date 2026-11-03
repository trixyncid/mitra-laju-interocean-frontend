"use client"

import { ColumnDef } from "@tanstack/react-table"

import { ServerEntityDataTable } from "@/components/server-entity-data-table"
import type { Vessel } from "@/app/dashboard/vessels/columns"
import { ActiveColumnFilters } from "@/components/column-filter/column-filter"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { VesselExportButton } from "@/components/vessels/vessel-export-button"

interface DataTableProps {
  columns: ColumnDef<Vessel>[]
  data: Vessel[]
  page: number
  pageSize: number
  totalPages: number
  totalRows: number
  applied: AppliedTableFilters
  onApply: (next: AppliedTableFilters) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

/** Status, dates and sorting live in the column headers' Excel-style menus. */
export function DataTable({
  columns,
  data,
  page,
  pageSize,
  totalPages,
  totalRows,
  applied,
  onApply,
  onPageChange,
  onPageSizeChange,
}: DataTableProps) {
  return (
    <ServerEntityDataTable
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      totalPages={totalPages}
      totalRows={totalRows}
      applied={applied}
      onApply={onApply}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      searchPlaceholder="Search vessel or voyage..."
      extra={<VesselExportButton applied={applied} totalRows={totalRows} />}
      beforeTable={<ActiveColumnFilters />}
    />
  )
}

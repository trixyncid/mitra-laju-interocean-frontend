"use client"

import { ServerEntityDataTable } from "@/components/server-entity-data-table"
import type { Vessel } from "@/app/dashboard/vessels/columns"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import {
  ACTIVE_STATUS_OPTIONS,
  type TableFilterConfig,
} from "@/lib/data-table-filters"
import { ColumnDef } from "@tanstack/react-table"

const vesselFilters: TableFilterConfig<Vessel> = {
  status: {
    id: "isActive",
    label: "Status",
    options: ACTIVE_STATUS_OPTIONS,
    getValue: (row) => row.isActive,
  },
  date: {
    id: "etd",
    label: "ETD",
    getValue: (row) => row.etd,
  },
}

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
      searchPlaceholder="Search by vessel name..."
      filters={vesselFilters}
    />
  )
}

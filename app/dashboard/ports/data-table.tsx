"use client"

import { ServerEntityDataTable } from "@/components/server-entity-data-table"
import type { Port } from "@/app/dashboard/ports/columns"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import {
  ACTIVE_STATUS_OPTIONS,
  type TableFilterConfig,
} from "@/lib/data-table-filters"
import { ColumnDef } from "@tanstack/react-table"

const portFilters: TableFilterConfig<Port> = {
  status: {
    id: "isActive",
    label: "Status",
    options: ACTIVE_STATUS_OPTIONS,
    getValue: (row) => row.isActive,
  },
  date: {
    id: "updatedAt",
    label: "Modified",
    getValue: (row) => row.updatedAt,
  },
}

interface DataTableProps {
  columns: ColumnDef<Port>[]
  data: Port[]
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
      searchPlaceholder="Search by port name..."
      filters={portFilters}
    />
  )
}

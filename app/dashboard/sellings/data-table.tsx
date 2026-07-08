"use client"

import { ServerEntityDataTable } from "@/components/server-entity-data-table"
import type { Selling } from "@/app/dashboard/sellings/columns"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import {
  PAYMENT_STATUS_OPTIONS,
  type TableFilterConfig,
} from "@/lib/data-table-filters"
import { ColumnDef } from "@tanstack/react-table"

const sellingFilters: TableFilterConfig<Selling> = {
  status: {
    id: "status",
    label: "Payment",
    options: PAYMENT_STATUS_OPTIONS,
    getValue: (row) => row.status,
  },
  date: {
    id: "updatedAt",
    label: "Modified",
    getValue: (row) => row.updatedAt,
  },
}

interface DataTableProps {
  columns: ColumnDef<Selling>[]
  data: Selling[]
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
      searchPlaceholder="Search by description..."
      filters={sellingFilters}
    />
  )
}

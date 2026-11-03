"use client"

import { ServerEntityDataTable } from "@/components/server-entity-data-table"
import type { User } from "@/app/dashboard/users/columns"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { ActiveColumnFilters } from "@/components/column-filter/column-filter"
import { ColumnDef } from "@tanstack/react-table"

interface DataTableProps {
  columns: ColumnDef<User>[]
  data: User[]
  page: number
  pageSize: number
  totalPages: number
  totalRows: number
  applied: AppliedTableFilters
  onApply: (next: AppliedTableFilters) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

/** Role, status, dates and sorting live in the column headers' Excel-style menus. */
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
      searchPlaceholder="Search name or email..."
      beforeTable={<ActiveColumnFilters />}
    />
  )
}

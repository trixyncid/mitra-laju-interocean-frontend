"use client"

import { ServerEntityDataTable } from "@/components/server-entity-data-table"
import type { Customer } from "@/app/dashboard/customers/columns"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { ActiveColumnFilters } from "@/components/column-filter/column-filter"
import { customerFilterParams } from "@/components/customers/customer-filter-provider"
import { TableExportButton } from "@/components/table-export-button"
import { customersService } from "@/services/customers.service"
import { ColumnDef } from "@tanstack/react-table"

interface DataTableProps {
  columns: ColumnDef<Customer>[]
  data: Customer[]
  page: number
  pageSize: number
  totalPages: number
  totalRows: number
  applied: AppliedTableFilters
  onApply: (next: AppliedTableFilters) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

/** Filtering is the Excel-style column headers (inside a CustomerFilterProvider) plus search. */
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
      searchPlaceholder="Search by customer name or code..."
      extra={
        <TableExportButton
          module="CUSTOMER"
          noun="customers"
          totalRows={totalRows}
          onExport={() => customersService.exportExcel(customerFilterParams(applied))}
        />
      }
      beforeTable={<ActiveColumnFilters />}
    />
  )
}

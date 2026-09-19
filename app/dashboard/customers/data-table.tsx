"use client"

import { ServerEntityDataTable } from "@/components/server-entity-data-table"
import type { Customer } from "@/app/dashboard/customers/columns"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import {
  SHIPMENT_TYPE_FILTER_OPTIONS,
  type TableFilterConfig,
} from "@/lib/data-table-filters"
import { ColumnDef } from "@tanstack/react-table"

const customerFilters: TableFilterConfig<Customer> = {
  shipmentType: {
    id: "shipmentTypes",
    label: "Shipment Type",
    options: SHIPMENT_TYPE_FILTER_OPTIONS,
    getValue: (row) => row.shipmentTypes ?? [],
  },
}

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
      filters={customerFilters}
    />
  )
}

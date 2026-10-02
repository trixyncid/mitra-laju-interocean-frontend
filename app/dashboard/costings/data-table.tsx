"use client"

import { ServerEntityDataTable } from "@/components/server-entity-data-table"
import type { Costing } from "@/app/dashboard/costings/columns"
import { CostingExportActions } from "@/app/dashboard/costings/costing-export-actions"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import {
  PAYMENT_STATUS_OPTIONS,
  type TableFilterConfig,
} from "@/lib/data-table-filters"
import { ColumnDef } from "@tanstack/react-table"

const costingFilters: TableFilterConfig<Costing> = {
  status: {
    id: "status",
    label: "Payment status",
    options: PAYMENT_STATUS_OPTIONS,
    getValue: (row) => row.status,
  },
  vendor: {
    id: "vendorId",
    label: "Vendor",
  },
  date: {
    id: "vendorInvoiceDate",
    label: "Invoice date",
    mode: "single",
    getValue: (row) => row.vendorInvoiceDate,
  },
  paymentDate: {
    id: "paymentDate",
    label: "Payment date",
    getValue: (row) => row.paymentDate,
  },
}

interface DataTableProps {
  columns: ColumnDef<Costing>[]
  data: Costing[]
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
      searchPlaceholder="Search costing #, vendor, invoice, vessel..."
      filters={costingFilters}
      extra={<CostingExportActions />}
    />
  )
}

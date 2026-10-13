"use client"

import { ServerEntityDataTable } from "@/components/server-entity-data-table"
import type { VendorInvoice } from "@/app/dashboard/vendor-invoices/columns"
import { VendorInvoiceExportActions } from "@/app/dashboard/vendor-invoices/vendor-invoice-export-actions"
import { ActiveColumnFilters } from "@/components/column-filter/column-filter"
import type { AppliedTableFilters } from "@/components/data-table-toolbar"
import { ColumnDef } from "@tanstack/react-table"

interface DataTableProps {
  columns: ColumnDef<VendorInvoice>[]
  data: VendorInvoice[]
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
      searchPlaceholder="Search vendor invoice #, vendor, invoice, vessel..."
      extra={<VendorInvoiceExportActions />}
      beforeTable={<ActiveColumnFilters />}
    />
  )
}

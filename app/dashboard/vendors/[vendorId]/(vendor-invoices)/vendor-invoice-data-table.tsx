"use client"

import { EntityDataTable } from "@/components/entity-data-table"
import type { VendorInvoice } from "./vendor-invoice-column"
import { type TableFilterConfig } from "@/lib/data-table-filters"
import { ColumnDef } from "@tanstack/react-table"

const nestedVendorInvoiceFilters: TableFilterConfig<VendorInvoice> = {
  date: {
    id: "updatedAt",
    label: "Updated",
    getValue: (row) => row.updatedAt,
  },
}

interface DataTableProps {
  columns: ColumnDef<VendorInvoice>[]
  data: VendorInvoice[]
}

export function DataTable({ columns, data }: DataTableProps) {
  return (
    <EntityDataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search by invoice number..."
      searchColumn="invoiceNumber"
      filters={nestedVendorInvoiceFilters}
    />
  )
}

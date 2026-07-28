"use client"

import { EntityDataTable } from "@/components/entity-data-table"
import type { CustomerSelling } from "./selling-column"
import {
  PAYMENT_STATUS_OPTIONS,
  type TableFilterConfig,
} from "@/lib/data-table-filters"
import { ColumnDef } from "@tanstack/react-table"

const nestedSellingFilters: TableFilterConfig<CustomerSelling> = {
  status: {
    id: "status",
    label: "Status",
    options: PAYMENT_STATUS_OPTIONS,
    getValue: (row) => row.status,
  },
  date: {
    id: "updatedAt",
    label: "Updated",
    getValue: (row) => row.updatedAt,
  },
}

interface DataTableProps {
  columns: ColumnDef<CustomerSelling>[]
  data: CustomerSelling[]
}

export function DataTable({ columns, data }: DataTableProps) {
  return (
    <EntityDataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search by selling number..."
      searchColumn="sellingNumber"
      filters={nestedSellingFilters}
    />
  )
}

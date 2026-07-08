"use client"

import { EntityDataTable } from "@/components/entity-data-table"
import type { Costing } from "./costing-column"
import { type TableFilterConfig } from "@/lib/data-table-filters"
import { ColumnDef } from "@tanstack/react-table"

const nestedCostingFilters: TableFilterConfig<Costing> = {
  date: {
    id: "updatedAt",
    label: "Updated",
    getValue: (row) => row.updatedAt,
  },
}

interface DataTableProps {
  columns: ColumnDef<Costing>[]
  data: Costing[]
}

export function DataTable({ columns, data }: DataTableProps) {
  return (
    <EntityDataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search by invoice number..."
      searchColumn="invoiceNumber"
      filters={nestedCostingFilters}
    />
  )
}

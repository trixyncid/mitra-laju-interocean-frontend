"use client"

import { EntityDataTable } from "@/components/entity-data-table"
import { ColumnDef, FilterFn } from "@tanstack/react-table"

const customerSearchFilter: FilterFn<unknown> = (row, _columnId, value) => {
  const search = String(value).toLowerCase()
  const name = (row.getValue("customerName") as string)?.toLowerCase() ?? ""
  const code = (row.getValue("customerCode") as string)?.toLowerCase() ?? ""
  return name.includes(search) || code.includes(search)
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  return (
    <EntityDataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search by customer name or code..."
      globalFilterFn={customerSearchFilter as FilterFn<TData>}
    />
  )
}

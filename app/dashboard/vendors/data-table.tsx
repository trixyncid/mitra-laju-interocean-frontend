"use client"

import { EntityDataTable } from "@/components/entity-data-table"
import { ColumnDef } from "@tanstack/react-table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  return (
    <EntityDataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search by vendor name..."
      searchColumn="vendorName"
    />
  )
}

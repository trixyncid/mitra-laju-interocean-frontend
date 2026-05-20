"use client"

import { EntityDataTable } from "@/components/entity-data-table"
import type { User } from "@/app/dashboard/users/columns"
import { ColumnDef } from "@tanstack/react-table"

interface DataTableProps {
  columns: ColumnDef<User>[]
  data: User[]
}

export function DataTable({ columns, data }: DataTableProps) {
  return (
    <EntityDataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search by name or email..."
      globalFilterFn={(row, _columnId, filterValue) => {
        const query = filterValue.toLowerCase()
        return (
          row.original.name.toLowerCase().includes(query) ||
          row.original.email.toLowerCase().includes(query)
        )
      }}
    />
  )
}

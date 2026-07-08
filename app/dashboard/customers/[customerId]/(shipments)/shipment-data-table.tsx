"use client"

import { EntityDataTable } from "@/components/entity-data-table"
import type { LinkedShipment } from "./shipment-columns"
import { type TableFilterConfig } from "@/lib/data-table-filters"
import { ColumnDef } from "@tanstack/react-table"

const linkedShipmentFilters: TableFilterConfig<LinkedShipment> = {
  date: {
    id: "eta",
    label: "ETA",
    getValue: (row) => row.eta || null,
  },
}

interface DataTableProps {
  columns: ColumnDef<LinkedShipment>[]
  data: LinkedShipment[]
}

export function DataTable({ columns, data }: DataTableProps) {
  return (
    <EntityDataTable
      columns={columns}
      data={data}
      searchPlaceholder="Filter shipment order number..."
      searchColumn="orderNumber"
      filters={linkedShipmentFilters}
    />
  )
}

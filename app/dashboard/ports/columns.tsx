"use client"

import PortActionCell from "@/components/action-cell/port-action-cell"
import { localDate} from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { StatusChip } from "@/components/ui/status-chip"
import { primaryText, secondaryText } from "@/lib/design"
import {
  actionColumn,
  dateSort,
  sortDescFirst,
  sortHeader,
  textSort,
} from "@/lib/data-table"

export type Port = {
    id?: string
    portName: string
    portCountry: string,
    updatedBy?: string,
    updatedAt?: string,
    isActive: boolean
}

export const columns: ColumnDef<Port>[] = [
    {
        accessorKey: "portName",
        header: ({ column }) => sortHeader(column, "Port Name"),
        ...textSort,
        cell: ({ row }) => <span className={primaryText}>{ row.original.portName }</span>
    },
    {
        accessorKey: "portCountry",
        header: ({ column }) => sortHeader(column, "Country"),
        ...textSort,
        cell: ({ row }) => <span className={secondaryText}>{row.original.portCountry}</span>
    },
    {
        id: "updatedBy",
        accessorFn: (row) => (row.updatedBy as { name?: string } | undefined)?.name ?? "",
        header: ({ column }) => sortHeader(column, "Modified By"),
        ...textSort,
        cell: ({ row }) => (
            <span className={secondaryText}>{(row.original.updatedBy as { name: string } | undefined)?.name}</span>
        ),
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => sortHeader(column, "Modified At"),
        ...dateSort,
        cell: ({ row }) => <span className={secondaryText}>{localDate(row.original.updatedAt as string)}</span>,
    },
    {
        accessorKey: "isActive",
        header: ({ column }) => sortHeader(column, "Status"),
        ...sortDescFirst,
        cell: ({ row }) => <StatusChip active={row.original.isActive} />
    },
    {
        ...actionColumn,
        header: "Action",
        cell: ({ row }) => <PortActionCell row={row} />
    },
]

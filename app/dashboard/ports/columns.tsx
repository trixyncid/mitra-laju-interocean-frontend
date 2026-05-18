"use client"

import PortActionCell from "@/components/action-cell/port-action-cell"
import { localDate} from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { StatusChip } from "@/components/ui/status-chip"
import { primaryText, secondaryText } from "@/lib/design"

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
        header: "Port Name",
        cell: ({ row }) => <span className={primaryText}>{ row.original.portName }</span>
    },
    {
        accessorKey: "portCountry",
        header: "Country",
        cell: ({ row }) => <span className={secondaryText}>{row.original.portCountry}</span>
    },
    {
        accessorKey: "updatedBy",
        header: "Modified By",
        cell: ({ row }) => (
            <span className={secondaryText}>{(row.original.updatedBy as { name: string } | undefined)?.name}</span>
        ),
    },
    {
        accessorKey: "updatedAt",
        header: "Modified At",
        cell: ({ row }) => <span className={secondaryText}>{localDate(row.original.updatedAt as string)}</span>,
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => <StatusChip active={row.original.isActive} />
    },
    {
        accessorKey: "",
        header: "Action",
        cell: ({ row }) => <PortActionCell row={row} />
    },
]

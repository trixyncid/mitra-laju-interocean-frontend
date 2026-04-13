"use client"

import PortActionCell from "@/components/action-cell/port-action-cell"
import { localDate} from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"
import { Dot } from "lucide-react"

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
        cell: ({ row }) => {
            return <div className="font-bold">{ row.original.portName }</div>
        }
    },
    {
        accessorKey: "portCountry",
        header: "Country"
    },
    {
        accessorKey: "updatedBy",
        header: "Modified By",
        cell: ({ row }) => {
            return <div>{ (row.original.updatedBy as { name: string } | undefined)?.name }</div>
        },
    },
    {
        accessorKey: "updatedAt",
        header: "Last Modified Date",
        cell: ({ row }) => {
            return <div>{ localDate(row.original.updatedAt as string) }</div>
        },
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            return <div className={clsx("pl-1 pr-3 w-fit rounded-full flex items-center text-xs", row.original.isActive ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500")}><Dot className="animate-pulse -mr-1" /> { row.original.isActive ? "Active" : "Inactive" }</div>
        }
    },
    {
        accessorKey: "",
        header: "Action",
        cell: ({ row }) => {
            return <PortActionCell row={row} />
        }
    },
]
"use client"

import PortForm from "@/components/forms/port-form"
import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"

export type Port = {
    id?: string
    portName: string
    portCountry: string
    isActive: boolean
}

export const columns: ColumnDef<Port>[] = [
    {
        accessorKey: "portName",
        header: "Port Name"
    },
    {
        accessorKey: "portCountry",
        header: "Country"
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            return <div className={clsx("px-3 py-1 w-fit rounded-full border font-semibold", row.original.isActive ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500")}>{ row.original.isActive ? "Active" : "Inactive" }</div>
        }
    },
    {
        accessorKey: "",
        header: "Action",
        cell: ({ row }) => {
            return <PortForm mode="edit" portName={row.original.portName} portCountry={row.original.portCountry} isActive={row.original.isActive} id={row.original.id} />
        }
    },
]
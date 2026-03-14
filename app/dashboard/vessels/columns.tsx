"use client"

import VesselActionCell from "@/components/action-cell/vessel-action-cell"
import { formatDate } from "@/lib/utils"

import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"
import { Dot } from "lucide-react"

export type Vessel = {
    id?: string
    vesselName: string
    voyageNumber: string
    etd: string | null | undefined
    closingReefer: string | null | undefined
    isActive: boolean
    updatedBy?: string,
    updatedAt?: string,
}

export const columns: ColumnDef<Vessel>[] = [
    {
        accessorKey: "vesselName",
        header: "Vessel Name",
        cell: ({ row }) => {
            return <div className="font-bold">{ row.original.vesselName }</div>
        }
    },
    {
        accessorKey: "voyageNumber",
        header: "Voyage Number"
    },
    {
        accessorKey: "etd",
        header: "ETD",
        cell: ({ row }) => {
            return <div className="">{ row.original.etd === null || row.original.etd === undefined ? <p className="bg-orange-50 text-orange-500 px-3 rounded-full w-fit">TBD</p> : formatDate(row.original.etd) }</div>   
        }
    },
    {
        accessorKey: "closingReefer",
        header: "Closing Reefer",
        cell: ({ row }) => {
            return <div className="">{ row.original.closingReefer === null || row.original.closingReefer === undefined ? <p className="bg-orange-50 text-orange-500 px-3 rounded-full w-fit">TBD</p> : formatDate(row.original.closingReefer) }</div>   
        }
    },
    {
        accessorKey: "updatedBy",
        header: "Modified By",
        cell: ({ row }) => {
            return <div>{ (row.original.updatedBy as { name: string } | undefined)?.name }</div>
        }
    },
    {
        accessorKey: "updatedAt",
        header: "Modified At",
        cell: ({ row }) => {
            return <div>{ formatDate(row.original.updatedAt as string) }</div>
        }
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
            return <VesselActionCell row={row} />
        }
    },
]
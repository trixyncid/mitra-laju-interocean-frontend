"use client"

import VesselForm from "@/components/forms/vessel-form"

import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"

export type Vessel = {
    vesselName: string
    voyage: string
    etd: string
    closingReefer: string
    isActive: boolean
}

export const columns: ColumnDef<Vessel>[] = [
    {
        accessorKey: "vesselName",
        header: "Vessel Name"
    },
    {
        accessorKey: "voyage",
        header: "Voyage"
    },
    {
        accessorKey: "etd",
        header: "ETD"
    },
    {
        accessorKey: "closingReefer",
        header: "Closing Reefer"
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
            return <VesselForm mode="edit" vesselName={ row.original.vesselName } voyage={ row.original.voyage } etd={ row.original.etd } closingReefer={ row.original.closingReefer } isActive={ row.original.isActive } />
        }
    },
]
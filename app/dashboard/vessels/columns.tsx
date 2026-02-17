"use client"

import VesselForm from "@/components/forms/vessel-form"
import { formatDate } from "@/lib/utils"

import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"

export type Vessel = {
    id?: string
    vesselName: string
    voyageNumber: string
    etd: string | null | undefined
    closingReefer: string | null | undefined
    isActive: boolean
}

export const columns: ColumnDef<Vessel>[] = [
    {
        accessorKey: "vesselName",
        header: "Vessel Name"
    },
    {
        accessorKey: "voyageNumber",
        header: "Voyage Number"
    },
    {
        accessorKey: "etd",
        header: "ETD",
        cell: ({ row }) => {
            return <div className="">{ row.original.etd === null || row.original.etd === undefined ? "-" : formatDate(row.original.etd) }</div>   
        }
    },
    {
        accessorKey: "closingReefer",
        header: "Closing Reefer",
        cell: ({ row }) => {
            return <div className="">{ row.original.closingReefer === null || row.original.closingReefer === undefined ? "-" : formatDate(row.original.closingReefer) }</div>   
        }
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
            return <VesselForm mode="edit" vesselName={ row.original.vesselName } voyageNumber={ row.original.voyageNumber } etd={ row.original.etd ?? undefined } closingReefer={ row.original.closingReefer ?? undefined } isActive={ row.original.isActive } id={ row.original.id ?? undefined } />
        }
    },
]
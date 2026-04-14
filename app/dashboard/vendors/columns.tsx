"use client"

import clsx from "clsx"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Dot, Info } from "lucide-react"
import VendorActionCell from "@/components/action-cell/vendor-action-cell"
import { localDate } from "@/lib/utils"

export type Vendor = {
    id?: string
    vendorCode: string
    vendorName: string
    npwp: string | null
    isActive: boolean
    updatedBy?: string
    updatedAt?: string
}

export const columns: ColumnDef<Vendor>[] = [
    {
        accessorKey: "vendorName",
        header: "Vendor Name",
        cell: ({ row }) => {
            return <div className="font-bold flex items-center gap-x-1">
                <Link href={`/dashboard/vendors/${row.original.id}`} className="hover:underline">{ row.original.vendorName }</Link><Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
        }
    },
    {
        accessorKey: "vendorCode",
        header: "Vendor Code"
    },
    {
        accessorKey: "npwp",
        header: "NPWP",
        cell: ({ row }) => {
            return <div className="">{ row.original.npwp === undefined || row.original.npwp === null || row.original.npwp === "" ? <p className="bg-orange-50 text-orange-500 px-3 rounded-full w-fit">Unavailable</p> : `${ row.original.npwp }`}</div>
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
            return <div>{ localDate(row.original.updatedAt as string) }</div>
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
            return <VendorActionCell row={row} />
        }
    },
]
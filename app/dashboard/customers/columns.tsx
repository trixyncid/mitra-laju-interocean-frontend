"use client"

import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"
import Link from "next/link"
import { Dot, Info } from "lucide-react"
import { formatDate } from "@/lib/utils"
import CustomerActionCell from "@/components/action-cell/customer-action-cell"

export type Customer = {
    id?: string
    customerCode: string
    customerName: string
    npwp: string
    isActive: boolean
    updatedBy?: string,
    updatedAt?: string,
}

export const columns: ColumnDef<Customer>[] = [
    {
        accessorKey: "customerName",
        header: "Customer Name",
        cell: ({ row }) => {
            return <div className="font-bold flex items-center gap-x-1">
                <Link href={`/dashboard/customers/${row.original.id}`} className="hover:underline">{ row.original.customerName }</Link><Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
        }
    },
    {
        accessorKey: "customerCode",
        header: "Customer Code"
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
        header: "Last Modified Date",
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
            return <CustomerActionCell row={row} />
        }
    },
]
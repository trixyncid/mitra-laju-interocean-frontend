"use client"

import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"
import CustomerForm from "@/components/forms/customer-form"
import Link from "next/link"
import { IconInfoCircle } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export type Customer = {
    id: string
    customerCode: string
    customerName: string
    npwp: string
    isActive: boolean
}

export const columns: ColumnDef<Customer>[] = [
    {
        accessorKey: "customerCode",
        header: "Customer Code"
    },
    {
        accessorKey: "customerName",
        header: "Customer Name"
    },
    {
        accessorKey: "npwp",
        header: "NPWP",
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
            return (
                <div className="flex gap-x-2">
                    <CustomerForm mode="edit" customerCode={ row.original.customerCode } customerName={ row.original.customerName } npwp={ row.original.npwp } />
                    <Button asChild>
                        <Link href={`/dashboard/customers/${row.original.id}`}><IconInfoCircle /></Link>
                    </Button>
                </div>
            )
        }
    },
]
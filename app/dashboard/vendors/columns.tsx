"use client"

import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"
import VendorForm from "@/components/forms/vendor-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { IconInfoCircle } from "@tabler/icons-react"

export type Vendor = {
    id: string | undefined
    vendorCode: string
    vendorName: string
    npwp: string | null
    isActive: boolean
}

export const columns: ColumnDef<Vendor>[] = [
    {
        accessorKey: "vendorCode",
        header: "Vendor Code"
    },
    {
        accessorKey: "vendorName",
        header: "Vendor Name"
    },
    {
        accessorKey: "npwp",
        header: "NPWP",
        cell: ({ row }) => {
            return <div className="">{ row.original.npwp === null ? "" : `${ row.original.npwp }`}</div>
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
            return (
                <div className="flex gap-x-2">
                    <VendorForm mode="edit" vendorName={row.original.vendorName} vendorCode={row.original.vendorCode} npwp={`${row.original.npwp ?? undefined}`} isActive={row.original.isActive} />
                    <Button asChild>
                        <Link href={`/dashboard/vendors/${row.original.id}`}><IconInfoCircle /></Link>
                    </Button>
                </div>
            )
        }
    },
]
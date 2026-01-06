"use client"

import { ColumnDef } from "@tanstack/react-table"
import { clsx } from "clsx"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type VendorContact = {
  vendorName: string
  phoneNumber: string
  email: string
  isActive: boolean
}

export const columns: ColumnDef<VendorContact>[] = [
    {
        accessorKey: "vendorName",
        header: "Vendor Name"
    },
    {
        accessorKey: "phoneNumber",
        header: "Phone Number"
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            return <div className={clsx("px-3 py-1 rounded-full", row.original.isActive ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500")}></div>
        }
    },
]
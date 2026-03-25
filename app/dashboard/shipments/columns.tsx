"use client"

import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"
import ShipmentActionCell from "@/components/action-cell/shipment-action-cell"


export type Shipment = {
    id: string
    orderNumber: string
    customerCode: string
    customerShipper: string
    isActive: boolean
}

export const columns: ColumnDef<Shipment>[] = [
    {
        accessorKey: "orderNumber",
        header: "Order Number"
    },
    {
        accessorKey: "customerCode",
        header: "Customer Code"
    },
    {
        accessorKey: "customerShipper",
        header: "Customer Shipper",
        enableGlobalFilter: false,
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            return <div className={clsx("px-3 py-1 w-fit rounded-full border font-semibold", row.original.isActive ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500")}>{ row.original.isActive ? "Active" : "Inactive" }</div>
        },
        enableGlobalFilter: false,
    },
    {
        accessorKey: "",
        header: "Action",
        cell: ({ row }) => {
            return <ShipmentActionCell row={row} />
        },
    },
]
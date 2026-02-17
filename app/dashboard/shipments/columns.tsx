"use client"

import { Button } from "@/components/ui/button"

import Link from "next/link"

import { IconEdit, IconInfoCircle } from "@tabler/icons-react"

import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"
import ShipmentForm from "@/components/forms/shipment-form"


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
            return (
                <div className="flex items-center">
                    <ShipmentForm mode="edit" orderNumber={row.original.orderNumber} customerCode={row.original.customerCode} customerShipper={row.original.customerShipper} />
  
                    <Button asChild className="ml-3">
                        <Link href={`/dashboard/shipments/${row.original.id}`}>
                            <IconInfoCircle />
                        </Link>
                    </Button>                    
                </div>
            )
        },
    },
]
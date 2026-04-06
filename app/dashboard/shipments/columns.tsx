"use client"

import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"
import ShipmentActionCell from "@/components/action-cell/shipment-action-cell"
import { IconArrowDown, IconArrowRight } from "@tabler/icons-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Dot, Info } from "lucide-react"


export type Shipment = {
    id?: string
    customerCodeId: string
    customerShipperId: string
    orderNumber: string
    customerCode?: { customerName: string, customerCode: string }
    customerShipper?: { name: string }
    shipmentOperational?: { portDeparture: { portCountry: string }, portDestination: { portCountry: string }}
    isActive: boolean
    updatedBy?: string
    updatedAt?: string
}

export const columns: ColumnDef<Shipment>[] = [
    {
        accessorKey: "orderNumber",
        header: "Order Number",
        cell: ({ row }) => {
            return <div className="font-bold flex items-center gap-x-1">
                <Link href={`/dashboard/shipments/${row.original.id}`} className="hover:underline">{ row.original.orderNumber }</Link><Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
        }
    },
    {
        accessorKey: "customerCode",
        header: "Customer Code",
        cell: ({ row }) => {
            return <div className="text-sm text-slate-500">{ row.original.customerCode?.customerName } ({ row.original.customerCode?.customerCode })</div>
        }
    },
    {
        accessorKey: "customerShipper",
        header: "Customer Shipper",
        enableGlobalFilter: false,
        cell: ({ row }) => {
            return <div className="text-sm text-slate-500">{ row.original.customerShipper?.name }</div>
        }
    },
    {
        accessorKey: "shipmentOperational",
        header: "Route",
        cell: ({ row }) => {
            return (
                <div>
                    {
                        row.original.shipmentOperational === null ? <div className="bg-orange-50 text-orange-500 px-3 rounded-full w-fit">Unavailable</div> :
                        <div className="text-sm text-slate-500">{ row.original.shipmentOperational?.portDeparture?.portCountry as string } <IconArrowDown className="w-4 h-4" /> { row.original.shipmentOperational?.portDestination?.portCountry as string }</div>
                    }
                </div>
            )
        }
    },
    {
        accessorKey: "updatedBy",
        header: "Modified By",
        cell: ({ row }) => {
            return <div className="text-sm text-slate-500">{ (row.original.updatedBy as { name: string } | undefined)?.name }</div>
        }
    },
    {
        accessorKey: "updatedAt",
        header: "Last Modified Date",
        cell: ({ row }) => {
            return <div className="text-sm text-slate-500">{ formatDate(row.original.updatedAt as string) }</div>
        }
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            return <div className={clsx("pl-1 pr-3 w-fit rounded-full flex items-center text-xs", row.original.isActive ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500")}><Dot className="animate-pulse -mr-1" /> { row.original.isActive ? "Active" : "Inactive" }</div>
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
"use client"

import { ColumnDef } from "@tanstack/react-table"
import ShipmentActionCell from "@/components/action-cell/shipment-action-cell"
import { IconArrowRight } from "@tabler/icons-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Info } from "lucide-react"
import { StatusChip, WarningChip } from "@/components/ui/status-chip"
import { primaryText, secondaryText } from "@/lib/design"

export type Shipment = {
    id?: string
    customerCodeId: string
    customerShipperId: string
    orderNumber: string
    customerCode?: { customerName: string, customerCode: string }
    customerShipper?: { name: string }
    shipmentOperational?: {
        shipmentType?: string
        portDeparture: { portCountry: string }
        portDestination: { portCountry: string }
    }
    isActive: boolean
    updatedBy?: string
    updatedAt?: string
}

export const columns: ColumnDef<Shipment>[] = [
    {
        accessorKey: "orderNumber",
        header: "Order Number",
        cell: ({ row }) => (
            <div className={`${primaryText} flex items-center gap-x-1`}>
                <Link href={`/dashboard/shipments/${row.original.id}`} className="hover:underline">{ row.original.orderNumber }</Link>
                <Info className="size-3.5 text-muted-foreground" />
            </div>
        )
    },
    {
        accessorKey: "customerCode",
        header: "Customer Code",
        cell: ({ row }) => (
            <span className={secondaryText}>
                {row.original.customerCode?.customerName} ({row.original.customerCode?.customerCode})
            </span>
        )
    },
    {
        accessorKey: "customerShipper",
        header: "Customer Shipper",
        enableGlobalFilter: false,
        cell: ({ row }) => <span className={secondaryText}>{row.original.customerShipper?.name}</span>
    },
    {
        accessorKey: "shipmentOperational",
        header: "Route",
        cell: ({ row }) => {
            if (!row.original.shipmentOperational) {
                return <WarningChip>Unavailable</WarningChip>
            }
            return (
                <span className={`${secondaryText} flex flex-row items-center gap-x-1`}>
                    {row.original.shipmentOperational.portDeparture.portCountry}
                    <IconArrowRight className="size-4" />
                    {row.original.shipmentOperational.portDestination.portCountry}
                </span>
            )
        }
    },
    {
        accessorKey: "updatedBy",
        header: "Modified By",
        cell: ({ row }) => (
            <span className={secondaryText}>{(row.original.updatedBy as { name: string } | undefined)?.name}</span>
        )
    },
    {
        accessorKey: "updatedAt",
        header: "Modified At",
        cell: ({ row }) => <span className={secondaryText}>{formatDate(row.original.updatedAt as string)}</span>
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => <StatusChip active={row.original.isActive} />,
        enableGlobalFilter: false,
    },
    {
        accessorKey: "",
        header: "Action",
        cell: ({ row }) => <ShipmentActionCell row={row} />,
    },
]

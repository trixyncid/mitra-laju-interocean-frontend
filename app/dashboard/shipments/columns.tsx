"use client"

import { ColumnDef } from "@tanstack/react-table"
import ShipmentActionCell from "@/components/action-cell/shipment-action-cell"
import { IconArrowRight } from "@tabler/icons-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Info } from "lucide-react"
import { ShipmentLifecycleChip, WarningChip } from "@/components/ui/status-chip"
import { primaryText, secondaryText } from "@/lib/design"
import {
  actionColumn,
  dateSort,
  sortDescFirst,
  sortHeader,
  textSort,
} from "@/lib/data-table"

export type Shipment = {
    id?: string
    customerCodeId: string
    customerShipperId: string
    orderNumber: string
    status: "ONGOING" | "COMPLETED"
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
        header: ({ column }) => sortHeader(column, "Order Number"),
        ...textSort,
        cell: ({ row }) => (
            <div className={`${primaryText} flex items-center gap-x-1`}>
                <Link href={`/dashboard/shipments/${row.original.id}`} className="hover:underline">{ row.original.orderNumber }</Link>
                <Info className="size-3.5 text-muted-foreground" />
            </div>
        )
    },
    {
        id: "customerCode",
        accessorFn: (row) =>
            row.customerCode
                ? `${row.customerCode.customerName} (${row.customerCode.customerCode})`
                : "",
        header: ({ column }) => sortHeader(column, "Customer Code"),
        ...textSort,
        cell: ({ row }) => (
            <span className={secondaryText}>
                {row.original.customerCode?.customerName} ({row.original.customerCode?.customerCode})
            </span>
        )
    },
    {
        id: "customerShipper",
        accessorFn: (row) => row.customerShipper?.name ?? "",
        header: ({ column }) => sortHeader(column, "Customer Shipper"),
        ...textSort,
        enableGlobalFilter: false,
        cell: ({ row }) => <span className={secondaryText}>{row.original.customerShipper?.name}</span>
    },
    {
        id: "route",
        accessorFn: (row) =>
            row.shipmentOperational
                ? `${row.shipmentOperational.portDeparture.portCountry} ${row.shipmentOperational.portDestination.portCountry}`
                : "",
        header: ({ column }) => sortHeader(column, "Route"),
        ...textSort,
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
        id: "updatedBy",
        accessorFn: (row) => (row.updatedBy as { name?: string } | undefined)?.name ?? "",
        header: ({ column }) => sortHeader(column, "Modified By"),
        ...textSort,
        cell: ({ row }) => (
            <span className={secondaryText}>{(row.original.updatedBy as { name: string } | undefined)?.name}</span>
        )
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => sortHeader(column, "Modified At"),
        ...dateSort,
        cell: ({ row }) => <span className={secondaryText}>{formatDate(row.original.updatedAt as string)}</span>
    },
    {
        accessorKey: "status",
        header: ({ column }) => sortHeader(column, "Shipment Status"),
        ...sortDescFirst,
        cell: ({ row }) => <ShipmentLifecycleChip status={row.original.status} />,
        enableGlobalFilter: false,
    },
    {
        ...actionColumn,
        header: "Action",
        cell: ({ row }) => <ShipmentActionCell row={row} />,
    },
]

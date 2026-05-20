"use client"

import CostingActionCell from "@/components/action-cell/costing-action-cell"
import { amountCalculation, localDate } from "@/lib/utils"
import { IconLinkOff } from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { Info } from "lucide-react"
import Link from "next/link"
import { PaymentStatusChip, UnlinkedChip } from "@/components/ui/status-chip"
import { primaryText, secondaryText } from "@/lib/design"

export type Costing = {
    id: string
    costingNumber: string
    createdAt: string
    description: string
    price: number
    currency: number
    vatPercentage: number
    pph23Percentage: number
    vendor?: { vendorName: string } | null
    shipment?: {
        orderNumber: string | null
        id: string | null
        isActive: boolean
        shipmentOperational?: {
            eta: string | null
            portDeparture?: { portName: string; portCountry: string }
            portDestination?: { portName: string; portCountry: string }
        }
        customerCode?: { customerCode?: string; customerName?: string }
        customerShipper?: { name?: string }
    } | null
    status: string
    containerId: string
    vendorInvoiceNumber: string
    vendorId: string
    sellingId?: string | null
    updatedBy?: string,
    updatedAt?: string,
}

export const columns: ColumnDef<Costing>[] = [
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <div className={`${primaryText} flex items-center`}>
                <Link href={`/dashboard/costings/${ row.original.id }`} className="hover:underline flex items-center gap-x-1">
                    { row.original.description } <Info className="size-3.5 text-muted-foreground" />
                </Link>
            </div>
        )
    },
    {
        accessorKey: "costingNumber",
        header: "Costing #",
        cell: ({ row }) => <span className={secondaryText}>{ row.original.costingNumber }</span>
    },
    {
        accessorKey: "vendor",
        header: "Vendor Name",
        cell: ({ row }) => (
            <span className={secondaryText}>{row.original.vendor?.vendorName ?? "—"}</span>
        )
    },
    {
        accessorKey: "",
        header: "Amount (Rupiah)",
        cell: ({ row }) => (
            <span className={secondaryText}>
                { amountCalculation(row.original.price, row.original.currency, row.original.vatPercentage, row.original.pph23Percentage).toLocaleString("id-ID", { style: "currency", currency: "IDR" }) }
            </span>
        )
    },
    {
        accessorKey: "shipment",
        header: "Shipment Order #",
        cell: ({ row }) => (
            !row.original.shipment ? (
                <span className="inline-flex items-center gap-x-2">
                    <UnlinkedChip />
                    <IconLinkOff className="size-3 text-muted-foreground" />
                </span>
            ) : (
                <span className={secondaryText}>{ row.original.shipment.orderNumber }</span>
            )
        )
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <PaymentStatusChip paid={row.original.status === "paid"} />
    },
    {
        accessorKey: "updatedBy",
        header: "Modified By",
        cell: ({ row }) => (
            <span className={secondaryText}>{ (row.original.updatedBy as { name: string } | undefined)?.name }</span>
        )
    },
    {
        accessorKey: "updatedAt",
        header: "Modified At",
        cell: ({ row }) => (
            <span className={secondaryText}>
                {row.original.updatedAt ? localDate(row.original.updatedAt) : "—"}
            </span>
        )
    },
    {
        accessorKey: "",
        header: "Action",
        cell: ({ row }) => <CostingActionCell row={row} />
    },
]

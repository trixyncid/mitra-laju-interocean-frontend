"use client"

import CostingActionCell from "@/components/action-cell/costing-action-cell"
import { amountCalculation, localDate } from "@/lib/utils"
import { IconLinkOff } from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { Info } from "lucide-react"
import Link from "next/link"
import { PaymentStatusChip, UnlinkedChip } from "@/components/ui/status-chip"
import { primaryText, secondaryText } from "@/lib/design"
import {
  actionColumn,
  dateSort,
  numberSort,
  sortDescFirst,
  sortHeader,
  textSort,
} from "@/lib/data-table"

export type Costing = {
    id: string
    costingNumber: string
    createdAt: string
    description: string
    price: number
    currencyCode: string
    currency: number
    vatPercentage: number
    pph23Percentage: number
    vendor?: { vendorName: string } | null
    containerNumber?: string | null
    shipment?: {
        orderNumber: string | null
        id: string | null
        status: "ONGOING" | "COMPLETED"
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
    vendorInvoiceNumber: string
    vendorId: string
    sellingId?: string | null
    updatedBy?: string,
    updatedAt?: string,
}

export type CostingAttachment = {
    id: string
    attachmentName: string
    fileName: string
    filePath: string
    createdAt: string
    createdBy: string
    updatedAt: string
    updatedBy: { name: string }
}

export type CostingDetail = Costing & {
    costingsAttachments?: CostingAttachment[]
    updatedBy?: { name: string } | null
    selling?: { id: string; sellingNumber: string } | null
}

export const columns: ColumnDef<Costing>[] = [
    {
        accessorKey: "description",
        header: ({ column }) => sortHeader(column, "Description"),
        ...textSort,
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
        header: ({ column }) => sortHeader(column, "Costing #"),
        ...textSort,
        cell: ({ row }) => <span className={secondaryText}>{ row.original.costingNumber }</span>
    },
    {
        id: "vendor",
        accessorFn: (row) => row.vendor?.vendorName ?? "",
        header: ({ column }) => sortHeader(column, "Vendor Name"),
        ...textSort,
        cell: ({ row }) => (
            <span className={secondaryText}>{row.original.vendor?.vendorName ?? "—"}</span>
        )
    },
    {
        id: "amount",
        accessorFn: (row) =>
            amountCalculation(row.price, row.currency, row.vatPercentage, row.pph23Percentage),
        header: ({ column }) => sortHeader(column, "Amount (Rupiah)"),
        ...numberSort,
        cell: ({ row }) => (
            <span className={secondaryText}>
                { amountCalculation(row.original.price, row.original.currency, row.original.vatPercentage, row.original.pph23Percentage).toLocaleString("id-ID", { style: "currency", currency: "IDR" }) }
            </span>
        )
    },
    {
        id: "shipment",
        accessorFn: (row) => row.shipment?.orderNumber ?? "",
        header: ({ column }) => sortHeader(column, "Shipment Order #"),
        ...textSort,
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
        header: ({ column }) => sortHeader(column, "Status"),
        ...textSort,
        cell: ({ row }) => <PaymentStatusChip paid={row.original.status === "PAID"} />
    },
    {
        id: "updatedBy",
        accessorFn: (row) => (row.updatedBy as { name?: string } | undefined)?.name ?? "",
        header: ({ column }) => sortHeader(column, "Modified By"),
        ...textSort,
        cell: ({ row }) => (
            <span className={secondaryText}>{ (row.original.updatedBy as { name: string } | undefined)?.name }</span>
        )
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => sortHeader(column, "Modified At"),
        ...dateSort,
        cell: ({ row }) => (
            <span className={secondaryText}>
                {row.original.updatedAt ? localDate(row.original.updatedAt) : "—"}
            </span>
        )
    },
    {
        ...actionColumn,
        header: "Action",
        cell: ({ row }) => <CostingActionCell row={row} />
    },
]

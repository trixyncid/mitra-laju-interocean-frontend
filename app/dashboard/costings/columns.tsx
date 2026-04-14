"use client"

import LinkCostingForm from "@/components/forms/link-costing-form"
import CostingForm from "@/components/forms/costing-form"
import { amountCalculation, formatDate, localDate } from "@/lib/utils"
import { IconLinkOff } from "@tabler/icons-react"

import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"
import { Dot, Info } from "lucide-react"
import Link from "next/link"

export type Costing = {
    id: string
    createdAt: string
    description: string
    price: number
    currency: number
    vatPercentage: number
    pph23Percentage: number
    vendor: { vendorName: string }
    shipment: { orderNumber: string | null, id: string | null, shipmentOperational?: { eta: string | null, portDeparture?: { portName: string, portCountry: string }, portDestination?: { portName: string, portCountry: string } }, customerCode?: { 
        customerCode?: string, customerName?: string
    }, customerShipper?: {
        name?: string
    } }
    status: string
    containerId: string
    vendorInvoiceNumber: string
    vendorId: string
    updatedBy?: string,
    updatedAt?: string,
}

export const columns: ColumnDef<Costing>[] = [
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
            return <div className="flex items-center font-semibold">
                <Link href={`/dashboard/costings/${ row.original.id }`} className="hover:underline flex items-center gap-x-1">{ row.original.description } <Info className="w-3.5 h-3.5 text-slate-400" /></Link>
            </div>
        }
    },
    {
        accessorKey: "createdAt",
        header: "Created Date",
        cell: ({ row }) => {
            return <div>{ formatDate(row.original.createdAt.split("T")[0]) }</div>
        }
    },
    {
        accessorKey: "vendor",
        header: "Vendor Name",
        cell: ({ row }) => {
            return <div className="flex items-center">
                <p>{ row.original.vendor.vendorName }</p>
            </div>
        }
    },
    {
        accessorKey: "",
        header: "Amount (Rupiah)",
        cell: ({ row }) => {
            return <div className="flex items-center">
                <p>{ amountCalculation(row.original.price, row.original.currency, row.original.vatPercentage, row.original.pph23Percentage).toLocaleString("id-ID", { style: "currency", currency: "IDR" }) }</p>
            </div>
        }
    },
    {
        accessorKey: "shipment",
        header: "Shipment Order #",
        cell: ({ row }) => {
            return <div className={clsx("px-3 py-1 rounded-full w-fit text-xs", row.original.shipment === null ? "bg-red-100 text-red-500" : "")}>{ row.original.shipment === null ? <div className="flex items-center gap-x-2"><IconLinkOff className="h-3 w-3 animate-pulse" /> Unlinked</div> : row.original.shipment.orderNumber }</div>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            return <div className={clsx("pr-3 w-fit rounded-full flex items-center text-xs", row.original.status === "PAID" ? "bg-green-100 text-green-500" : "bg-orange-100 text-orange-500")}> <Dot className="animate-pulse -mr-1" /> { row.original.status === "PAID" ? "Paid" : "Unpaid" }</div>
        }
    },
    {
        accessorKey: "updatedBy",
        header: "Modified By",
        cell: ({ row }) => {
            return <div>{ (row.original.updatedBy as { name: string } | undefined)?.name }</div>
        }
    },
    {
        accessorKey: "updatedAt",
        header: "Modified At",
        cell: ({ row }) => {
            return <div>{ localDate(row.original.updatedAt as string) }</div>
        }
    },
    {
        accessorKey: "",
        header: "Action",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-x-2">
                    <CostingForm mode="edit" id={row.original.id} description={row.original.description} price={row.original.price} currency={row.original.currency} containerId={row.original.containerId} vatPercentage={row.original.vatPercentage} pph23Percentage={row.original.pph23Percentage} vendorInvoiceNumber={row.original.vendorInvoiceNumber} vendorId={row.original.vendorId} />
                    <LinkCostingForm id={row.original.id} shipmentId={row.original.shipment?.id ?? undefined} />
                </div>
            )
        }
    },
]
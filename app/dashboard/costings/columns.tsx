"use client"

import LinkCostingForm from "@/components/forms/link-costing-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconEdit, IconInfoCircle, IconLink, IconLinkOff } from "@tabler/icons-react"

import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"
import Link from "next/link"

export type Costing = {
    id: string
    date: string
    description: string
    vendorName: string
    orderNumber: string | null
    status: string
    amount: number
}

export const columns: ColumnDef<Costing>[] = [
    {
        accessorKey: "createdAt",
        header: "Date"
    },
    {
        accessorKey: "description",
        header: "Description"
    },
    {
        accessorKey: "vendorName",
        header: "Vendor Name"
    },
    {
        accessorKey: "orderNumber",
        header: "Shipment Order #",
        cell: ({ row }) => {
            return <div className={clsx("px-3 py-1 rounded-md w-fit", row.original.orderNumber === null ? "bg-red-100 text-red-500" : "")}>{ row.original.orderNumber === null ? <div className="flex items-center gap-x-2"><IconLinkOff className="w-4 h-4" /> Unlinked</div> : row.original.orderNumber }</div>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            return <div className={clsx("px-3 py-1 w-fit rounded-full border font-semibold", row.original.status === "PAID" ? "bg-green-100 text-green-500" : "bg-orange-100 text-orange-500")}>{ row.original.status === "PAID" ? "Paid" : "Unpaid" }</div>
        }
    },
    {
        accessorKey: "",
        header: "Action",
        cell: ({ row }) => {
            return (
                <div className="flex items-center">
                    <LinkCostingForm shipmentOrderNumber={row.original.orderNumber ? row.original.orderNumber : undefined} />

                    <Button asChild className="ml-2">
                        <Link href={`/dashboard/costings/${ row.original.id }`}><IconInfoCircle /></Link>
                    </Button>
                </div>
            )
        }
    },
]
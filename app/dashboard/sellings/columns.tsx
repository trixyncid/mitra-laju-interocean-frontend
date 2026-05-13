"use client"

import SellingForm from "@/components/forms/selling-form"
import { sellingNetAmount } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { IconLinkOff } from "@tabler/icons-react"
import { Dot, Info } from "lucide-react"
import Link from "next/link"
import clsx from "clsx"
import { localDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { IconTrash } from "@tabler/icons-react"
import { useDeleteSelling } from "@/hooks/use-sellings"
import { toast } from "sonner"
import { useState } from "react"
import { Row } from "@tanstack/react-table"
import LinkSellingShipmentForm from "@/components/forms/link-selling-shipment-form"

export type Selling = {
    id: string
    sellingNumber: string
    description: string
    amount: number
    vatPercentage: number
    pph23Percentage: number
    status: string
    shipmentId: string | null
    shipment: { orderNumber: string | null, id: string | null } | null
    costings?: { id: string, description: string }[]
    updatedBy?: string
    updatedAt?: string
}

function SellingActionCell({ row }: { row: Row<Selling> }) {
    const [open, setOpen] = useState(false)
    const deleteSelling = useDeleteSelling()

    return (
        <div className="flex items-center gap-x-2">
            <LinkSellingShipmentForm
                sellingId={row.original.id}
                shipmentId={row.original.shipmentId ?? undefined}
            />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <IconTrash className="text-red-500 hover:bg-red-50" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Selling</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Are you sure you want to delete this selling entry? This action cannot be undone.
                    </DialogDescription>
                    <DialogFooter>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                deleteSelling.mutate(row.original.id, {
                                    onSuccess: () => setOpen(false),
                                    onError: (error: Error) => toast.warning(error.message)
                                })
                            }}
                        >
                            Delete
                        </Button>
                        <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export const columns: ColumnDef<Selling>[] = [
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
            <div className="font-semibold flex items-center gap-x-1">
                <Link href={`/dashboard/sellings/${row.original.id}`} className="hover:underline flex items-center gap-x-1">
                    {row.original.description} <Info className="w-3.5 h-3.5 text-slate-400" />
                </Link>
            </div>
        )
    },
    {
        accessorKey: "sellingNumber",
        header: "Selling #",
        cell: ({ row }) => <p>{row.original.sellingNumber}</p>
    },
    {
        accessorKey: "amount",
        header: "Net Amount (Rp)",
        cell: ({ row }) => (
            <p>
                {sellingNetAmount(row.original.amount, row.original.vatPercentage, row.original.pph23Percentage)
                    .toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
            </p>
        )
    },
    {
        accessorKey: "shipment",
        header: "Shipment Order #",
        cell: ({ row }) => (
            <div className={clsx("px-3 py-1 rounded-full w-fit text-xs", row.original.shipment === null ? "bg-red-100 text-red-500" : "")}>
                {row.original.shipment === null
                    ? <div className="flex items-center gap-x-2"><IconLinkOff className="h-3 w-3 animate-pulse" /> Unlinked</div>
                    : row.original.shipment.orderNumber
                }
            </div>
        )
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <div className={clsx("pr-3 w-fit rounded-full flex items-center text-xs", row.original.status === "paid" ? "bg-green-100 text-green-500" : "bg-orange-100 text-orange-500")}>
                <Dot className="animate-pulse -mr-1" /> {row.original.status === "paid" ? "Paid" : "Unpaid"}
            </div>
        )
    },
    {
        accessorKey: "updatedBy",
        header: "Modified By",
        cell: ({ row }) => <div>{(row.original.updatedBy as { name: string } | undefined)?.name}</div>
    },
    {
        accessorKey: "updatedAt",
        header: "Modified At",
        cell: ({ row }) => <div>{localDate(row.original.updatedAt as string)}</div>
    },
    {
        accessorKey: "",
        header: "Action",
        cell: ({ row }) => <SellingActionCell row={row} />
    },
]

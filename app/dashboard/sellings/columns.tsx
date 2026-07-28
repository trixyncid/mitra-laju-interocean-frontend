"use client"

import { sellingNetAmount, localDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { IconLinkOff } from "@tabler/icons-react"
import { Info } from "lucide-react"
import Link from "next/link"
import { PaymentStatusChip, UnlinkedChip } from "@/components/ui/status-chip"
import { primaryText, secondaryText } from "@/lib/design"
import { Button } from "@/components/ui/button"
import { DeleteConfirmButton } from "@/components/ui/delete-confirm-button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { IconTrash } from "@tabler/icons-react"
import { useDeleteSelling } from "@/hooks/use-sellings"
import { toast } from "sonner"
import { useState } from "react"
import { Row } from "@tanstack/react-table"
import LinkSellingShipmentForm from "@/components/forms/link-selling-shipment-form"
import { usePermissions } from "@/hooks/use-permissions"
import {
  actionColumn,
  dateSort,
  numberSort,
  sortDescFirst,
  sortHeader,
  textSort,
} from "@/lib/data-table"

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
    createdAt?: string
    updatedBy?: string
    updatedAt?: string
}

function SellingActionCell({ row }: { row: Row<Selling> }) {
    const { canWrite } = usePermissions()
    const [open, setOpen] = useState(false)
    const deleteSelling = useDeleteSelling()

    if (!canWrite("sellings")) return null

    return (
        <div className="flex items-center gap-x-2">
            <LinkSellingShipmentForm
                sellingId={row.original.id}
                shipmentId={row.original.shipmentId ?? undefined}
            />
            <Dialog open={open} onOpenChange={(next) => { if (deleteSelling.isPending) return; setOpen(next) }}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Delete selling">
                        <IconTrash className="text-[var(--mli-on-error-container)] hover:bg-[var(--mli-error-container)]" />
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
                        <DeleteConfirmButton
                            isPending={deleteSelling.isPending}
                            onClick={() => {
                                deleteSelling.mutate(row.original.id, {
                                    onSuccess: () => setOpen(false),
                                    onError: (error: Error) => toast.warning(error.message)
                                })
                            }}
                        />
                        <DialogClose asChild>
                            <Button variant="secondary" disabled={deleteSelling.isPending}>Cancel</Button>
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
        header: ({ column }) => sortHeader(column, "Description"),
        ...textSort,
        cell: ({ row }) => (
            <div className={`${primaryText} flex items-center gap-x-1`}>
                <Link href={`/dashboard/sellings/${row.original.id}`} className="hover:underline flex items-center gap-x-1">
                    {row.original.description} <Info className="size-3.5 text-muted-foreground" />
                </Link>
            </div>
        )
    },
    {
        accessorKey: "sellingNumber",
        header: ({ column }) => sortHeader(column, "Selling #"),
        ...textSort,
        cell: ({ row }) => <span className={secondaryText}>{row.original.sellingNumber}</span>
    },
    {
        id: "netAmount",
        accessorFn: (row) => sellingNetAmount(row.amount, row.vatPercentage, row.pph23Percentage),
        header: ({ column }) => sortHeader(column, "Net Amount (Rp)"),
        ...numberSort,
        cell: ({ row }) => (
            <p>
                {sellingNetAmount(row.original.amount, row.original.vatPercentage, row.original.pph23Percentage)
                    .toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
            </p>
        )
    },
    {
        id: "shipment",
        accessorFn: (row) => row.shipment?.orderNumber ?? "",
        header: ({ column }) => sortHeader(column, "Shipment Order #"),
        ...textSort,
        cell: ({ row }) => (
            row.original.shipment === null ? (
                <span className="inline-flex items-center gap-x-2">
                    <UnlinkedChip />
                    <IconLinkOff className="size-3 text-muted-foreground" />
                </span>
            ) : (
                <span className={secondaryText}>{row.original.shipment.orderNumber}</span>
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
        cell: ({ row }) => <span className={secondaryText}>{(row.original.updatedBy as { name: string } | undefined)?.name}</span>
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => sortHeader(column, "Modified At"),
        ...dateSort,
        cell: ({ row }) => <span className={secondaryText}>{localDate(row.original.updatedAt as string)}</span>
    },
    {
        ...actionColumn,
        header: "Action",
        cell: ({ row }) => <SellingActionCell row={row} />
    },
]

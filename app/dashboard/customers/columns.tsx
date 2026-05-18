"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Info } from "lucide-react"
import { localDate } from "@/lib/utils"
import CustomerActionCell from "@/components/action-cell/customer-action-cell"
import { StatusChip, WarningChip } from "@/components/ui/status-chip"
import { primaryText, secondaryText } from "@/lib/design"

export type Customer = {
    id?: string
    customerCode: string
    customerName: string
    npwp: string
    isActive: boolean
    updatedBy?: string,
    updatedAt?: string,
}

export const columns: ColumnDef<Customer>[] = [
    {
        accessorKey: "customerName",
        header: "Customer Name",
        cell: ({ row }) => (
            <div className={`${primaryText} flex items-center gap-x-1`}>
                <Link href={`/dashboard/customers/${row.original.id}`} className="hover:underline">{ row.original.customerName }</Link>
                <Info className="size-3.5 text-muted-foreground" />
            </div>
        )
    },
    {
        accessorKey: "customerCode",
        header: "Customer Code",
        cell: ({ row }) => <span className={secondaryText}>{row.original.customerCode}</span>
    },
    {
        accessorKey: "npwp",
        header: "NPWP",
        cell: ({ row }) => {
            return row.original.npwp ? (
                <span className={secondaryText}>{row.original.npwp}</span>
            ) : (
                <WarningChip>Unavailable</WarningChip>
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
        cell: ({ row }) => <span className={secondaryText}>{localDate(row.original.updatedAt as string)}</span>
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => <StatusChip active={row.original.isActive} />
    },
    {
        accessorKey: "",
        header: "Action",
        cell: ({ row }) => <CustomerActionCell row={row} />
    },
]

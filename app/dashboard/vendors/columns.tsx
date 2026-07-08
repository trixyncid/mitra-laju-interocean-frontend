"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Info } from "lucide-react"
import VendorActionCell from "@/components/action-cell/vendor-action-cell"
import { localDate } from "@/lib/utils"
import { StatusChip, WarningChip } from "@/components/ui/status-chip"
import { primaryText, secondaryText } from "@/lib/design"
import {
  actionColumn,
  dateSort,
  sortDescFirst,
  sortHeader,
  textSort,
} from "@/lib/data-table"

export type Vendor = {
    id?: string
    vendorCode: string
    vendorName: string
    npwp: string | null
    isActive: boolean
    createdAt?: string
    updatedBy?: { name?: string } | string | null
    updatedAt?: string
}

export const columns: ColumnDef<Vendor>[] = [
    {
        accessorKey: "vendorName",
        header: ({ column }) => sortHeader(column, "Vendor Name"),
        ...textSort,
        cell: ({ row }) => (
            <div className={`${primaryText} flex items-center gap-x-1`}>
                <Link href={`/dashboard/vendors/${row.original.id}`} className="hover:underline">{ row.original.vendorName }</Link>
                <Info className="size-3.5 text-muted-foreground" />
            </div>
        )
    },
    {
        accessorKey: "vendorCode",
        header: ({ column }) => sortHeader(column, "Vendor Code"),
        ...textSort,
        cell: ({ row }) => <span className={secondaryText}>{row.original.vendorCode}</span>
    },
    {
        accessorKey: "npwp",
        header: ({ column }) => sortHeader(column, "NPWP"),
        ...textSort,
        cell: ({ row }) => {
            return row.original.npwp ? (
                <span className={secondaryText}>{row.original.npwp}</span>
            ) : (
                <WarningChip>Unavailable</WarningChip>
            )
        }
    },
    {
        id: "updatedBy",
        accessorFn: (row) =>
          typeof row.updatedBy === "string"
            ? row.updatedBy
            : row.updatedBy?.name ?? "",
        header: ({ column }) => sortHeader(column, "Modified By"),
        ...textSort,
        cell: ({ row }) => (
            <span className={secondaryText}>
              {typeof row.original.updatedBy === "string"
                ? row.original.updatedBy
                : row.original.updatedBy?.name}
            </span>
        )
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => sortHeader(column, "Modified At"),
        ...dateSort,
        cell: ({ row }) => <span className={secondaryText}>{localDate(row.original.updatedAt as string)}</span>
    },
    {
        accessorKey: "isActive",
        header: ({ column }) => sortHeader(column, "Status"),
        ...sortDescFirst,
        cell: ({ row }) => <StatusChip active={row.original.isActive} />
    },
    {
        ...actionColumn,
        header: "Action",
        cell: ({ row }) => <VendorActionCell row={row} />
    },
]

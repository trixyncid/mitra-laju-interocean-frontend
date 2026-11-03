"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Info } from "lucide-react"
import { localDate } from "@/lib/utils"
import CustomerActionCell from "@/components/action-cell/customer-action-cell"
import { ColumnFilterHeader } from "@/components/column-filter/column-filter"
import { StatusChip, WarningChip } from "@/components/ui/status-chip"
import { ShipmentTypeTags } from "@/components/ui/shipment-type-tag"
import { primaryText, secondaryText } from "@/lib/design"
import type { ShipmentType } from "@/lib/permissions"
import {
  actionColumn,
  sortHeader,
  textSort,
} from "@/lib/data-table"

export type Customer = {
    id?: string
    customerCode: string
    customerName: string
    npwp: string
    address?: string | null
    shipmentTypes?: ShipmentType[]
    isActive: boolean
    createdAt?: string
    updatedBy?: { name?: string } | string | null
    updatedAt?: string
}

export const columns: ColumnDef<Customer>[] = [
    {
        accessorKey: "customerName",
        header: () => <ColumnFilterHeader field="customer" sortKey="customerName" label="Customer Name" />,
        cell: ({ row }) => (
            <div className={`${primaryText} flex items-center gap-x-1.5`}>
                <span className="inline-flex items-center gap-x-1">
                    <Link href={`/dashboard/customers/${row.original.id}`} className="hover:underline">{ row.original.customerName }</Link>
                    <Info className="size-3.5 text-muted-foreground" />
                </span>
            </div>
        )
    },
    {
        accessorKey: "customerCode",
        header: () => <ColumnFilterHeader sortKey="customerCode" label="Customer Code" />,
        cell: ({ row }) => <span className={secondaryText}>{row.original.customerCode}</span>
    },
    {
        id: "shipmentTypes",
        header: () => <ColumnFilterHeader field="shipmentType" label="Shipment Type" />,
        cell: ({ row }) =>
            row.original.shipmentTypes?.length ? (
                <ShipmentTypeTags types={row.original.shipmentTypes} />
            ) : (
                <span className={secondaryText}>—</span>
            )
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
        header: () => <ColumnFilterHeader field="modified" sortKey="modified" label="Modified At" />,
        cell: ({ row }) => <span className={secondaryText}>{localDate(row.original.updatedAt as string)}</span>
    },
    {
        accessorKey: "isActive",
        header: () => <ColumnFilterHeader field="status" label="Status" />,
        cell: ({ row }) => <StatusChip active={row.original.isActive} />
    },
    {
        ...actionColumn,
        header: "Action",
        cell: ({ row }) => <CustomerActionCell row={row} />
    },
]

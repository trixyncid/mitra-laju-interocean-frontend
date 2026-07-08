"use client"

import VesselActionCell from "@/components/action-cell/vessel-action-cell"
import { localDate, formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { StatusChip, TbdChip } from "@/components/ui/status-chip"
import { primaryText, secondaryText } from "@/lib/design"
import {
  actionColumn,
  dateSort,
  sortDescFirst,
  sortHeader,
  textSort,
} from "@/lib/data-table"

export type Vessel = {
    id?: string
    vesselName: string
    voyageNumber: string
    etd: string | null | undefined
    closingReefer: string | null | undefined
    isActive: boolean
    updatedBy?: string,
    updatedAt?: string,
}

export const columns: ColumnDef<Vessel>[] = [
    {
        accessorKey: "vesselName",
        header: ({ column }) => sortHeader(column, "Vessel Name"),
        ...textSort,
        cell: ({ row }) => {
            return <span className={primaryText}>{ row.original.vesselName }</span>
        }
    },
    {
        accessorKey: "voyageNumber",
        header: ({ column }) => sortHeader(column, "Voyage Number"),
        ...textSort,
        cell: ({ row }) => (
            <span className={secondaryText}>{row.original.voyageNumber}</span>
        ),
    },
    {
        accessorKey: "etd",
        header: ({ column }) => sortHeader(column, "ETD"),
        ...dateSort,
        cell: ({ row }) => {
            return row.original.etd === null || row.original.etd === undefined ? (
                <TbdChip />
            ) : (
                <span className={secondaryText}>{formatDate(row.original.etd)}</span>
            )
        }
    },
    {
        accessorKey: "closingReefer",
        header: ({ column }) => sortHeader(column, "Closing Reefer"),
        ...dateSort,
        cell: ({ row }) => {
            return row.original.closingReefer === null || row.original.closingReefer === undefined ? (
                <TbdChip />
            ) : (
                <span className={secondaryText}>{formatDate(row.original.closingReefer)}</span>
            )
        }
    },
    {
        id: "updatedBy",
        accessorFn: (row) => (row.updatedBy as { name?: string } | undefined)?.name ?? "",
        header: ({ column }) => sortHeader(column, "Modified By"),
        ...textSort,
        cell: ({ row }) => {
            return <span className={secondaryText}>{(row.original.updatedBy as { name: string } | undefined)?.name}</span>
        }
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => sortHeader(column, "Modified At"),
        ...dateSort,
        cell: ({ row }) => {
            return <span className={secondaryText}>{localDate(row.original.updatedAt as string)}</span>
        }
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
        cell: ({ row }) => <VesselActionCell row={row} />
    },
]

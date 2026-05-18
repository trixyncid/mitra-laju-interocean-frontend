"use client"

import VesselActionCell from "@/components/action-cell/vessel-action-cell"
import { localDate, formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { StatusChip, TbdChip } from "@/components/ui/status-chip"
import { primaryText, secondaryText } from "@/lib/design"

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
        header: "Vessel Name",
        cell: ({ row }) => {
            return <span className={primaryText}>{ row.original.vesselName }</span>
        }
    },
    {
        accessorKey: "voyageNumber",
        header: "Voyage Number",
        cell: ({ row }) => (
            <span className={secondaryText}>{row.original.voyageNumber}</span>
        ),
    },
    {
        accessorKey: "etd",
        header: "ETD",
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
        header: "Closing Reefer",
        cell: ({ row }) => {
            return row.original.closingReefer === null || row.original.closingReefer === undefined ? (
                <TbdChip />
            ) : (
                <span className={secondaryText}>{formatDate(row.original.closingReefer)}</span>
            )
        }
    },
    {
        accessorKey: "updatedBy",
        header: "Modified By",
        cell: ({ row }) => {
            return <span className={secondaryText}>{(row.original.updatedBy as { name: string } | undefined)?.name}</span>
        }
    },
    {
        accessorKey: "updatedAt",
        header: "Modified At",
        cell: ({ row }) => {
            return <span className={secondaryText}>{localDate(row.original.updatedAt as string)}</span>
        }
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => <StatusChip active={row.original.isActive} />
    },
    {
        accessorKey: "",
        header: "Action",
        cell: ({ row }) => <VesselActionCell row={row} />
    },
]

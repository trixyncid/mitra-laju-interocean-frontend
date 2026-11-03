"use client"

import VesselActionCell from "@/components/action-cell/vessel-action-cell"
import { ColumnFilterHeader } from "@/components/column-filter/column-filter"
import { formatCalendarDate } from "@/lib/date-input"
import { localDate } from "@/lib/utils"
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
    eta?: string | null
    closingReefer: string | null | undefined
    isActive: boolean
    updatedBy?: string,
    updatedAt?: string,
}

export const columns: ColumnDef<Vessel>[] = [
    {
        accessorKey: "vesselName",
        header: () => <ColumnFilterHeader field="vesselName" sortKey="vesselName" label="Vessel Name" />,
        ...textSort,
        cell: ({ row }) => {
            return <span className={primaryText}>{ row.original.vesselName }</span>
        }
    },
    {
        accessorKey: "voyageNumber",
        header: () => <ColumnFilterHeader field="voyageNumber" sortKey="voyageNumber" label="Voyage Number" />,
        ...textSort,
        cell: ({ row }) => (
            <span className={secondaryText}>{row.original.voyageNumber}</span>
        ),
    },
    {
        accessorKey: "etd",
        header: () => <ColumnFilterHeader field="etd" sortKey="etd" label="ETD" />,
        ...dateSort,
        cell: ({ row }) => {
            return row.original.etd === null || row.original.etd === undefined ? (
                <TbdChip />
            ) : (
                <span className={secondaryText}>{formatCalendarDate(row.original.etd)}</span>
            )
        }
    },
    {
        accessorKey: "eta",
        header: () => <ColumnFilterHeader field="eta" sortKey="eta" label="ETA" />,
        ...dateSort,
        cell: ({ row }) => {
            return row.original.eta === null || row.original.eta === undefined ? (
                <TbdChip />
            ) : (
                <span className={secondaryText}>{formatCalendarDate(row.original.eta)}</span>
            )
        }
    },
    {
        accessorKey: "closingReefer",
        header: () => <ColumnFilterHeader field="closingReefer" sortKey="closingReefer" label="Closing Reefer" />,
        ...dateSort,
        cell: ({ row }) => {
            return row.original.closingReefer === null || row.original.closingReefer === undefined ? (
                <TbdChip />
            ) : (
                <span className={secondaryText}>{formatCalendarDate(row.original.closingReefer)}</span>
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
        header: () => <ColumnFilterHeader field="status" label="Status" />,
        ...sortDescFirst,
        cell: ({ row }) => <StatusChip active={row.original.isActive} />
    },
    {
        ...actionColumn,
        header: "Action",
        cell: ({ row }) => <VesselActionCell row={row} />
    },
]

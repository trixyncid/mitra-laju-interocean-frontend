"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Info } from "lucide-react"
import VendorActionCell from "@/components/action-cell/vendor-action-cell"
import { localDate } from "@/lib/utils"
import { ColumnFilterHeader } from "@/components/column-filter/column-filter"
import { StatusChip, WarningChip } from "@/components/ui/status-chip"
import { ShipmentTypeTags } from "@/components/ui/shipment-type-tag"
import { primaryText, secondaryText } from "@/lib/design"
import type { ShipmentType } from "@/lib/permissions"
import type { ServiceRef } from "@/app/dashboard/services/columns"
import {
  actionColumn,
  sortHeader,
  textSort,
} from "@/lib/data-table"

export type Vendor = {
    id?: string
    vendorCode: string
    vendorName: string
    npwp: string | null
    shipmentTypes?: ShipmentType[]
    services?: ServiceRef[]
    /** Write-only: replaces the vendor's services. */
    serviceIds?: string[]
    isActive: boolean
    createdAt?: string
    updatedBy?: { name?: string } | string | null
    updatedAt?: string
}

export const columns: ColumnDef<Vendor>[] = [
    {
        accessorKey: "vendorName",
        header: () => <ColumnFilterHeader field="vendor" sortKey="vendorName" label="Vendor Name" />,
        cell: ({ row }) => (
            <div className={`${primaryText} flex items-center gap-x-1.5`}>
                <span className="inline-flex items-center gap-x-1">
                    <Link href={`/dashboard/vendors/${row.original.id}`} className="hover:underline">{ row.original.vendorName }</Link>
                    <Info className="size-3.5 text-muted-foreground" />
                </span>
            </div>
        )
    },
    {
        accessorKey: "vendorCode",
        header: () => <ColumnFilterHeader sortKey="vendorCode" label="Vendor Code" />,
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
        id: "shipmentTypes",
        header: () => <ColumnFilterHeader field="shipmentType" label="Shipment Types" />,
        cell: ({ row }) =>
            row.original.shipmentTypes?.length ? (
                <ShipmentTypeTags types={row.original.shipmentTypes} />
            ) : (
                <span className={secondaryText}>—</span>
            )
    },
    {
        id: "services",
        header: () => <ColumnFilterHeader field="service" label="Services" />,
        cell: ({ row }) =>
            row.original.services?.length ? (
                <span className={`${secondaryText} block max-w-[16rem] truncate`} title={row.original.services.map((service) => service.serviceName).join(", ")}>
                    {row.original.services.map((service) => service.serviceName).join(", ")}
                </span>
            ) : (
                <span className={secondaryText}>—</span>
            )
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
        header: () => <ColumnFilterHeader field="modifiedDate" sortKey="updatedAt" label="Modified At" />,
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
        cell: ({ row }) => <VendorActionCell row={row} />
    },
]

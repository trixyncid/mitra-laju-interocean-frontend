"use client"

import { ColumnDef } from "@tanstack/react-table"
import ShipmentActionCell from "@/components/action-cell/shipment-action-cell"
import { IconArrowRight } from "@tabler/icons-react"
import { cn, localDate } from "@/lib/utils"
import Link from "next/link"
import { Info } from "lucide-react"
import { ShipmentLifecycleChip, WarningChip } from "@/components/ui/status-chip"
import { ShipmentTypeTag } from "@/components/ui/shipment-type-tag"
import {
    ContainerSummaryTags,
    formatContainerTag,
} from "@/components/ui/container-summary-tags"
import { primaryText, secondaryText } from "@/lib/design"
import {
  actionColumn,
  dateSort,
  sortDescFirst,
  sortHeader,
  textSort,
} from "@/lib/data-table"
import type { ShipmentStatus } from "@/lib/shipment-status"
import type { ReactNode } from "react"

export type ShipmentContainerSummary = {
    containerNumber: string | null
    sealNumber: string | null
    containerSize?: { name: string } | null
    containerType?: { name: string } | null
}

export type Shipment = {
    id?: string
    customerCodeId: string
    customerShipperId: string
    orderNumber: string
    status: ShipmentStatus
    customerCode?: { customerName: string, customerCode: string }
    customerShipper?: { name: string }
    shipmentOperational?: {
        shipmentType?: string
        blNumber?: string | null
        bookingNumber?: string | null
        remarks?: string | null
        portDeparture: { portName: string; portCountry: string } | null
        portDestination: { portName: string; portCountry: string } | null
        vessel?: { vesselName: string; voyageNumber: string } | null
        truckingBookTo?: { vendorName: string; vendorCode: string } | null
        freightBookTo?: { vendorName: string; vendorCode: string } | null
        shipmentOperationalContainers?: ShipmentContainerSummary[]
    }
    isActive: boolean
    updatedBy?: string
    updatedAt?: string
}

function displayValue(value: string | null | undefined) {
    const trimmed = value?.trim()
    return trimmed ? trimmed : "—"
}

function StackedValue({
    top,
    bottom,
}: {
    top: ReactNode
    bottom: ReactNode
}) {
    return (
        <div className="flex min-w-0 max-w-[16rem] flex-col gap-0.5">
            <span className={cn(secondaryText, "truncate")}>{top}</span>
            <span className="truncate text-xs text-muted-foreground">{bottom}</span>
        </div>
    )
}

function vendorLabel(
    vendor?: { vendorName: string; vendorCode: string } | null
) {
    if (!vendor) return null
    if (!vendor.vendorName && !vendor.vendorCode) return null
    if (!vendor.vendorCode) return vendor.vendorName
    return `${vendor.vendorName} (${vendor.vendorCode})`
}

function LabeledStack({
    items,
    labelClassName,
}: {
    items: { label: string; value: string | null | undefined }[]
    labelClassName?: string
}) {
    return (
        <div className="flex min-w-0 max-w-[16rem] flex-col gap-0.5">
            {items.map((item) => (
                <div key={item.label} className="flex min-w-0 items-baseline gap-1.5">
                    <span
                        className={cn(
                            "w-14 shrink-0 text-[10px] font-medium tracking-wide text-muted-foreground uppercase",
                            labelClassName
                        )}
                    >
                        {item.label}
                    </span>
                    <span className={cn(secondaryText, "truncate")} title={displayValue(item.value)}>
                        {displayValue(item.value)}
                    </span>
                </div>
            ))}
        </div>
    )
}

export const columns: ColumnDef<Shipment>[] = [
    {
        accessorKey: "orderNumber",
        header: ({ column }) => sortHeader(column, "Order Number"),
        ...textSort,
        cell: ({ row }) => (
            <div className={`${primaryText} flex items-center gap-x-1`}>
                <Link href={`/dashboard/shipments/${row.original.id}`} className="hover:underline">{ row.original.orderNumber }</Link>
                <Info className="size-3.5 text-muted-foreground" />
            </div>
        )
    },
    {
        id: "customerCode",
        accessorFn: (row) =>
            [
                row.customerCode
                    ? `${row.customerCode.customerName} (${row.customerCode.customerCode})`
                    : "",
                row.customerShipper?.name ?? "",
                row.shipmentOperational?.shipmentType ?? "",
            ].join(" "),
        header: ({ column }) => sortHeader(column, "Customer"),
        ...textSort,
        cell: ({ row }) => {
            const customer = row.original.customerCode
            const type = row.original.shipmentOperational?.shipmentType
            const name = customer
                ? `${customer.customerName} (${customer.customerCode})`
                : "—"
            return (
                <div className="flex min-w-0 max-w-[18rem] flex-col gap-0.5">
                    <span className={cn(secondaryText, "inline-flex min-w-0 items-center gap-1.5")}>
                        <span className="truncate">{name}</span>
                        {type ? (
                            <ShipmentTypeTag type={type} className="shrink-0 px-2 py-0.5 text-xs" />
                        ) : null}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                        {displayValue(row.original.customerShipper?.name)}
                    </span>
                </div>
            )
        }
    },
    {
        id: "vessel",
        accessorFn: (row) => {
            const vessel = row.shipmentOperational?.vessel
            if (!vessel) return ""
            return `${vessel.vesselName} v. ${vessel.voyageNumber}`
        },
        header: ({ column }) => sortHeader(column, "Vessel"),
        ...textSort,
        enableGlobalFilter: false,
        cell: ({ row }) => {
            const vessel = row.original.shipmentOperational?.vessel
            if (!vessel?.vesselName && !vessel?.voyageNumber) {
                return <WarningChip>Unavailable</WarningChip>
            }
            return (
                <StackedValue
                    top={displayValue(vessel?.vesselName)}
                    bottom={vessel?.voyageNumber ? `v. ${vessel.voyageNumber}` : "—"}
                />
            )
        }
    },
    {
        id: "route",
        accessorFn: (row) =>
            row.shipmentOperational
                ? `${row.shipmentOperational.portDeparture?.portName ?? ""} ${row.shipmentOperational.portDestination?.portName ?? ""}`
                : "",
        header: ({ column }) => sortHeader(column, "Route"),
        ...textSort,
        cell: ({ row }) => {
            if (!row.original.shipmentOperational) {
                return <WarningChip>Unavailable</WarningChip>
            }
            const departure = row.original.shipmentOperational.portDeparture?.portName
            const destination = row.original.shipmentOperational.portDestination?.portName
            if (!departure && !destination) {
                return <WarningChip>Unavailable</WarningChip>
            }
            return (
                <span className={`${secondaryText} flex flex-row items-center gap-x-1`}>
                    {departure ?? "—"}
                    <IconArrowRight className="size-4 shrink-0" />
                    {destination ?? "—"}
                </span>
            )
        }
    },
    {
        id: "bookingBl",
        accessorFn: (row) =>
            `${row.shipmentOperational?.bookingNumber ?? ""} ${row.shipmentOperational?.blNumber ?? ""}`,
        header: ({ column }) => sortHeader(column, "Booking / BL"),
        ...textSort,
        enableGlobalFilter: false,
        cell: ({ row }) => {
            if (!row.original.shipmentOperational) {
                return <WarningChip>Unavailable</WarningChip>
            }
            return (
                <LabeledStack
                    items={[
                        {
                            label: "Booking",
                            value: row.original.shipmentOperational.bookingNumber,
                        },
                        {
                            label: "BL",
                            value: row.original.shipmentOperational.blNumber,
                        },
                    ]}
                />
            )
        }
    },
    {
        id: "bookTo",
        accessorFn: (row) =>
            [
                vendorLabel(row.shipmentOperational?.truckingBookTo) ?? "",
                vendorLabel(row.shipmentOperational?.freightBookTo) ?? "",
            ].join(" "),
        header: ({ column }) => sortHeader(column, "Book To"),
        ...textSort,
        enableGlobalFilter: false,
        cell: ({ row }) => {
            if (!row.original.shipmentOperational) {
                return <WarningChip>Unavailable</WarningChip>
            }
            return (
                <LabeledStack
                    labelClassName="w-16"
                    items={[
                        {
                            label: "Trucking",
                            value: vendorLabel(row.original.shipmentOperational.truckingBookTo),
                        },
                        {
                            label: "Freight",
                            value: vendorLabel(row.original.shipmentOperational.freightBookTo),
                        },
                    ]}
                />
            )
        }
    },
    {
        id: "remarks",
        accessorFn: (row) => row.shipmentOperational?.remarks ?? "",
        header: ({ column }) => sortHeader(column, "Remarks"),
        ...textSort,
        enableGlobalFilter: false,
        meta: { cellClassName: "whitespace-normal min-w-[10rem] max-w-[16rem]" },
        cell: ({ row }) => {
            if (!row.original.shipmentOperational) {
                return <WarningChip>Unavailable</WarningChip>
            }
            const remarks = row.original.shipmentOperational.remarks?.trim()
            if (!remarks) {
                return <span className={secondaryText}>—</span>
            }
            return (
                <span className={cn(secondaryText, "line-clamp-2")} title={remarks}>
                    {remarks}
                </span>
            )
        }
    },
    {
        id: "containers",
        accessorFn: (row) =>
            (row.shipmentOperational?.shipmentOperationalContainers ?? [])
                .map(formatContainerTag)
                .join(" "),
        header: ({ column }) => sortHeader(column, "Containers"),
        ...textSort,
        enableGlobalFilter: false,
        meta: { cellClassName: "whitespace-normal min-w-[12rem] max-w-[18rem]" },
        cell: ({ row }) => {
            if (!row.original.shipmentOperational) {
                return <WarningChip>Unavailable</WarningChip>
            }

            return (
                <ContainerSummaryTags
                    containers={
                        row.original.shipmentOperational.shipmentOperationalContainers ?? []
                    }
                />
            )
        }
    },
    {
        accessorKey: "status",
        header: ({ column }) => sortHeader(column, "Status"),
        ...sortDescFirst,
        cell: ({ row }) => <ShipmentLifecycleChip status={row.original.status} />,
        enableGlobalFilter: false,
    },
    {
        id: "updatedBy",
        accessorFn: (row) => (row.updatedBy as { name?: string } | undefined)?.name ?? "",
        header: ({ column }) => sortHeader(column, "Modified By"),
        ...textSort,
        enableHiding: true,
        cell: ({ row }) => (
            <span className={secondaryText}>{(row.original.updatedBy as { name: string } | undefined)?.name}</span>
        )
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
        cell: ({ row }) => <ShipmentActionCell row={row} />,
    },
]

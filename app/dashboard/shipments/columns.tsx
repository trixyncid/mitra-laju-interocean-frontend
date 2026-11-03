"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ColumnFilterHeader } from "@/components/column-filter/column-filter"
import { formatCalendarDate } from "@/lib/date-input"
import ShipmentActionCell from "@/components/action-cell/shipment-action-cell"
import { IconArrowRight } from "@tabler/icons-react"
import { cn, localDate } from "@/lib/utils"
import Link from "next/link"
import { vesselLabel } from "@/lib/shipment-reference"
import { vendorLabel } from "@/lib/vendor-label"
import { salesBilling } from "@/lib/sales-billing"
import { RecordLink } from "@/components/record-link"
import type { ServiceRef } from "@/app/dashboard/services/columns"
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

export type ShipmentContainerSummary = {
    containerNumber: string | null
    sealNumber: string | null
    containerSize?: { name: string } | null
    containerType?: { name: string } | null
}

/** A service booked on a shipment, and the vendor it is booked to. */
export type ShipmentServiceLine = {
    id?: string
    serviceId: string
    vendorId: string | null
    service: ServiceRef
    vendor: { id: string; vendorName: string; vendorCode: string } | null
}

/** The sales job a shipment belongs to (list responses). */
export type ShipmentSalesLink = {
    id: string
    salesNumber: string
    sellings: { id: string; customerInvoice: { id: string; customerInvoiceStatus: string } | null }[]
    customerInvoices: { id: string; customerInvoiceNumber: string; customerInvoiceStatus: string }[]
}

export type Shipment = {
    id?: string
    customerCodeId: string
    customerShipperId: string
    status: ShipmentStatus
    customerCode?: { customerName: string, customerCode: string }
    customerShipper?: { name: string }
    shipmentOperational?: {
        shipmentType?: string
        blNumber?: string | null
        bookingNumber?: string | null
        remarks?: string | null
        eta?: string | null
        loadingInAt?: string | null
        loadingOutAt?: string | null
        portDeparture: { portName: string; portCountry: string } | null
        portDestination: { portName: string; portCountry: string } | null
        vessel?: { vesselName: string; voyageNumber: string } | null
        services?: ShipmentServiceLine[]
        shipmentOperationalContainers?: ShipmentContainerSummary[]
    }
    sales?: ShipmentSalesLink | null
    isActive: boolean
    updatedBy?: string
    updatedAt?: string
}

function displayValue(value: string | null | undefined) {
    const trimmed = value?.trim()
    return trimmed ? trimmed : "—"
}

/** Lines shown in the Services cell before "+N more". */
const SERVICE_CELL_LIMIT = 3

function LabeledStack({
    items,
    labelClassName,
}: {
    items: { key?: string; label: string; value: string | null | undefined }[]
    labelClassName?: string
}) {
    return (
        <div className="flex min-w-0 max-w-[16rem] flex-col gap-0.5">
            {items.map((item) => (
                <div key={item.key ?? item.label} className="flex min-w-0 items-baseline gap-1.5">
                    <span
                        className={cn(
                            "w-14 shrink-0 truncate text-[10px] font-medium tracking-wide text-muted-foreground uppercase",
                            labelClassName
                        )}
                        title={item.label}
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
        id: "customerCode",
        accessorFn: (row) =>
            [
                row.customerCode
                    ? `${row.customerCode.customerName} (${row.customerCode.customerCode})`
                    : "",
                row.customerShipper?.name ?? "",
                row.shipmentOperational?.shipmentType ?? "",
            ].join(" "),
        header: () => (
            <span className="flex items-center gap-4">
                <ColumnFilterHeader field="customer" sortKey="customer" label="Customer" />
                <ColumnFilterHeader field="type" sortKey="type" label="Type" />
            </span>
        ),
        ...textSort,
        cell: ({ row }) => {
            const customer = row.original.customerCode
            const type = row.original.shipmentOperational?.shipmentType
            return (
                <div className="flex min-w-0 max-w-[18rem] flex-col gap-0.5">
                    <span className={cn(secondaryText, "inline-flex min-w-0 items-center gap-1.5")}>
                        {customer ? (
                            <Link
                                href={`/dashboard/shipments/${row.original.id}`}
                                title={customer.customerName}
                                className={cn(primaryText, "truncate hover:underline")}
                            >
                                {customer.customerCode}
                            </Link>
                        ) : (
                            <span>—</span>
                        )}
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
        id: "sales",
        accessorFn: (row) =>
            row.sales
                ? [row.sales.salesNumber, ...row.sales.customerInvoices.map((invoice) => invoice.customerInvoiceNumber)].join(" ")
                : "",
        header: ({ column }) => sortHeader(column, "Sales # · Reference · Status"),
        ...textSort,
        enableGlobalFilter: false,
        cell: ({ row }) => {
            const sales = row.original.sales
            if (!sales) {
                return <span className={cn(secondaryText, "whitespace-nowrap")}>Not linked</span>
            }
            const billing = salesBilling(sales)
            const invoices = sales.customerInvoices
            return (
                <div className="flex min-w-0 max-w-[16rem] flex-col gap-0.5">
                    <span className="flex items-center gap-2">
                        <RecordLink
                            module="SALES"
                            href={`/dashboard/sales/${sales.id}`}
                            className="font-mono text-[13px] font-semibold whitespace-nowrap text-foreground hover:underline"
                        >
                            {sales.salesNumber}
                        </RecordLink>
                        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", billing.tone)}>
                            {billing.label}
                        </span>
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                        {invoices.length ? (
                            invoices.map((invoice, index) => (
                                <span key={invoice.id}>
                                    {index > 0 ? ", " : ""}
                                    <RecordLink
                                        module="CUSTOMER_INVOICE"
                                        href={`/dashboard/customer-invoices/${invoice.id}`}
                                        className="font-mono hover:underline"
                                    >
                                        {invoice.customerInvoiceNumber}
                                    </RecordLink>
                                </span>
                            ))
                        ) : (
                            "No invoice yet"
                        )}
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
            return vesselLabel(vessel) ?? ""
        },
        header: () => <ColumnFilterHeader field="vessel" sortKey="vessel" label="Vessel" />,
        ...textSort,
        enableGlobalFilter: false,
        cell: ({ row }) => {
            const vessel = row.original.shipmentOperational?.vessel
            if (!vessel?.vesselName && !vessel?.voyageNumber) {
                return <WarningChip>Unavailable</WarningChip>
            }
            const label = vesselLabel(vessel) ?? undefined
            return (
                <span className={cn(secondaryText, "block max-w-[16rem] truncate")} title={label}>
                    {label}
                </span>
            )
        }
    },
    {
        id: "route",
        accessorFn: (row) =>
            row.shipmentOperational
                ? `${row.shipmentOperational.portDeparture?.portName ?? ""} ${row.shipmentOperational.portDestination?.portName ?? ""}`
                : "",
        header: () => (
            <span className="flex items-center gap-2">
                <ColumnFilterHeader field="departure" sortKey="departure" label="From" />
                <IconArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <ColumnFilterHeader field="destination" sortKey="destination" label="To" />
            </span>
        ),
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
        id: "loadingOutAt",
        accessorFn: (row) => row.shipmentOperational?.loadingOutAt ?? "",
        header: () => <ColumnFilterHeader field="loading" sortKey="loading" label="Loading out" />,
        enableGlobalFilter: false,
        cell: ({ row }) => (
            <span className={cn(secondaryText, "whitespace-nowrap")}>
                {formatCalendarDate(row.original.shipmentOperational?.loadingOutAt, "—")}
            </span>
        ),
    },
    {
        id: "eta",
        accessorFn: (row) => row.shipmentOperational?.eta ?? "",
        header: () => <ColumnFilterHeader field="eta" sortKey="eta" label="ETA" />,
        enableGlobalFilter: false,
        cell: ({ row }) => (
            <span className={cn(secondaryText, "whitespace-nowrap")}>
                {formatCalendarDate(row.original.shipmentOperational?.eta, "—")}
            </span>
        ),
    },
    {
        id: "bookingBl",
        accessorFn: (row) =>
            `${row.shipmentOperational?.bookingNumber ?? ""} ${row.shipmentOperational?.blNumber ?? ""}`,
        header: () => <ColumnFilterHeader field="bl" label="Booking / BL" />,
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
        id: "services",
        accessorFn: (row) =>
            (row.shipmentOperational?.services ?? [])
                .map((line) => `${line.service.serviceName} ${vendorLabel(line.vendor) ?? ""}`)
                .join(" "),
        header: () => (
            <span className="flex items-center gap-4">
                <ColumnFilterHeader field="service" label="Services" />
                <ColumnFilterHeader field="serviceVendor" label="Vendor" />
            </span>
        ),
        ...textSort,
        enableGlobalFilter: false,
        cell: ({ row }) => {
            if (!row.original.shipmentOperational) {
                return <WarningChip>Unavailable</WarningChip>
            }
            const lines = row.original.shipmentOperational.services ?? []
            if (lines.length === 0) {
                return <span className={secondaryText}>—</span>
            }
            const hidden = lines.length - SERVICE_CELL_LIMIT
            return (
                <div className="flex min-w-0 max-w-[18rem] flex-col gap-0.5">
                    <LabeledStack
                        labelClassName="w-16 normal-case tracking-normal text-[11px]"
                        items={lines.slice(0, SERVICE_CELL_LIMIT).map((line, index) => ({
                            key: line.id ?? `${line.serviceId}-${index}`,
                            label: line.service.serviceName,
                            value: vendorLabel(line.vendor),
                        }))}
                    />
                    {hidden > 0 ? (
                        <span
                            className="text-xs text-muted-foreground"
                            title={lines
                                .slice(SERVICE_CELL_LIMIT)
                                .map((line) => `${line.service.serviceName}: ${vendorLabel(line.vendor) ?? "—"}`)
                                .join("\n")}
                        >
                            +{hidden} more
                        </span>
                    ) : null}
                </div>
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
        header: () => <ColumnFilterHeader field="status" sortKey="status" label="Status" />,
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
        header: "Actions",
        cell: ({ row }) => <ShipmentActionCell row={row} />,
    },
]

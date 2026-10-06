"use client"

import { use, useState } from "react"
import Link from "next/link"
import {
    IconArrowLeft,
    IconBox,
    IconEye,
    IconFile,
    IconFileInvoice,
    IconReceipt,
    IconRoute,
    IconShip,
    IconTags,
} from "@tabler/icons-react"
import { Dot } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import ShipmentOperationalForm from "@/components/forms/shipment-operational-form"
import ShipmentContainerForm from "@/components/forms/shipment-container-form"
import DocumentUploadForm from "@/components/forms/document-upload-form"
import LinkShipmentCostingForm, {
    UnlinkShipmentCostingButton,
} from "@/components/forms/link-shipment-costing-form"
import ShipmentCostingBreakdownTaxForm from "@/components/forms/shipment-costing-breakdown-tax-form"
import CreateSellingInvoiceForm, {
    isInvoicableBreakdown,
} from "@/components/forms/create-selling-invoice-form"
import { Checkbox } from "@/components/ui/checkbox"
import { usePermissions } from "@/hooks/use-permissions"
import { useShipmentById, useUpdateShipment } from "@/hooks/use-shipments"
import { formatCalendarDate } from "@/lib/date-input"
import {
    cn,
    costingLineUnitPlusPpn,
    costingSellingLineNet,
    costingShipmentLineNet,
    costingShipmentNetTotal,
    invoiceProfit,
    localDate,
} from "@/lib/utils"
import { Costing } from "../../costings/columns"
import { shipmentsService } from "@/services/shipments.service"
import ShipmentLoading from "@/components/loading/shipment-loading"
import { PermissionGate } from "@/components/permission-gate"
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
import { ShipmentStatusControl } from "@/components/ui/shipment-status-control"
import {
    PaymentStatusChip,
    SellingStatusChip,
    ShipmentLifecycleChip,
    TbdChip,
    VendorInvoiceTypeChip,
    WarningChip,
} from "@/components/ui/status-chip"
import {
    COSTING_MODULE_ENABLED,
    FINANCIAL_MODULES_ENABLED,
    SELLING_MODULE_ENABLED,
} from "@/lib/feature-flags"
import type { ShipmentStatus } from "@/lib/shipment-status"
import ErrorPage from "@/components/error-page"
import type { ShipmentLinkedSelling } from "@/lib/types/entity-details"
import {
    brandLink,
    brandText,
    glassInset,
    glassPanel,
    glassShine,
    metadataIconWell,
    tableCellClass,
    tableHeaderCell,
    tableHeaderRow,
    tableRowClass,
    tableShell,
} from "@/lib/design"
import { ShipmentTypeTag } from "@/components/ui/shipment-type-tag"

export type ShipmentOperationalContainer = {
    id?: string
    containerNumber: string | null
    sealNumber: string | null
    containerSizeId: string | null
    containerTypeId: string | null
    containerSize?: { id: string; name: string }
    containerType?: { id: string; name: string }
    isActive: boolean
    updatedAt: string
    updatedBy: { name: string }
}

export type ShipmentOperationalAttachment = {
    id?: string
    attachmentName: string
    filePath: string
    fileName: string
    contentType: string
    size: number
    updatedAt: string
    updatedBy: { name: string }
}

function formatContainerLookup(item?: { name: string } | null) {
    return item?.name || "—"
}

function linkedFinancialSetupStep(): string | null {
    if (!FINANCIAL_MODULES_ENABLED) return null
    if (COSTING_MODULE_ENABLED && SELLING_MODULE_ENABLED) {
        return "Linked costings & invoices"
    }
    if (COSTING_MODULE_ENABLED) return "Linked costings"
    if (SELLING_MODULE_ENABLED) return "Customer invoices"
    return null
}

const SETUP_STEPS = (() => {
    const base = ["Route & vessel"] as const
    const financialStep = linkedFinancialSetupStep()
    const rest = ["Containers", "Documents"] as const
    return financialStep ? [...base, financialStep, ...rest] : [...base, ...rest]
})()

function operationalSetupDescription() {
    if (!FINANCIAL_MODULES_ENABLED) {
        return "Set the route, vessel, and shipment type to unlock containers and documents."
    }
    const linkedParts: string[] = []
    if (COSTING_MODULE_ENABLED) linkedParts.push("costings")
    if (SELLING_MODULE_ENABLED) linkedParts.push("sellings")
    const linkedLabel =
        linkedParts.length === 2
            ? "linked costings and sellings"
            : linkedParts.length === 1
              ? `linked ${linkedParts[0]}`
              : "financial links"
    return `Set the route, vessel, and shipment type to unlock ${linkedLabel}, containers, and documents.`
}

type ShipmentLinkedBreakdown = {
    id: string
    price: number | string
    currencyPrice: number | string
    quantity?: number | string | null
    productDescription?: string
    vatPercentage?: number | string | null
    pph23Percentage?: number | string | null
    sellingAmount?: number | string | null
    sellingVatPercentage?: number | string | null
    sellingPph23Percentage?: number | string | null
    sellingId?: string | null
    costing?: Costing | null
}

function costingNetAmount(costing: Costing) {
    return costingShipmentNetTotal(costing.costingBreakdowns ?? [])
}

function linkedCostingsFromBreakdowns(
    breakdowns: ShipmentLinkedBreakdown[] | undefined
): Array<Costing & { linkedBreakdownIds: string[]; linkedLines: ShipmentLinkedBreakdown[] }> {
    const map = new Map<
        string,
        Costing & { linkedBreakdownIds: string[]; linkedLines: ShipmentLinkedBreakdown[] }
    >()
    for (const line of breakdowns ?? []) {
        const costing = line.costing
        if (!costing?.id) continue
        const existing = map.get(costing.id)
        if (existing) {
            existing.linkedBreakdownIds.push(line.id)
            existing.linkedLines.push(line)
            existing.costingBreakdowns = [
                ...(existing.costingBreakdowns ?? []),
                line as never,
            ]
        } else {
            map.set(costing.id, {
                ...costing,
                costingBreakdowns: [line as never],
                linkedBreakdownIds: [line.id],
                linkedLines: [line],
            })
        }
    }
    return Array.from(map.values())
}

function MetricTile({
    label,
    value,
    hint,
}: {
    label: string
    value: string | number
    hint?: string
}) {
    return (
        <div className={cn(glassInset, "flex flex-col gap-2 px-5 py-4")}>
            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                {label}
            </p>
            <p className="text-xl font-semibold tracking-tight text-foreground tabular-nums break-words sm:text-2xl">
                {value}
            </p>
            {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
    )
}

function SectionIntro({
    title,
    description,
    action,
}: {
    title: string
    description: string
    action?: React.ReactNode
}) {
    return (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
                <h2 className="text-headline-md font-semibold tracking-tight">{title}</h2>
                <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    )
}

function EmptyState({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
    action?: React.ReactNode
}) {
    return (
        <div
            className={cn(
                glassInset,
                "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center"
            )}
        >
            <div className="flex size-12 items-center justify-center rounded-md bg-[rgba(214,227,255,0.45)] text-[var(--mli-primary-container)]">
                <Icon className="size-6" />
            </div>
            <div className="space-y-1">
                <p className="font-semibold text-foreground">{title}</p>
                <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
            </div>
            {action ? <div className="pt-1">{action}</div> : null}
        </div>
    )
}

function CountPill({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-md bg-[rgba(214,227,255,0.4)] px-2.5 py-1 text-xs font-medium text-[var(--mli-primary-container)]">
            {children}
        </span>
    )
}

function OverviewField({
    label,
    children,
    className,
}: {
    label: string
    children: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                {label}
            </p>
            <div className="text-sm font-medium text-foreground">{children}</div>
        </div>
    )
}

function formatIdr(value: number) {
    return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

function formatPort(port: { portName: string; portCountry: string } | null | undefined) {
    if (!port) return null
    return `${port.portName} (${port.portCountry})`
}

export default function ShipmentDetailPage({
    params,
}: {
    params: Promise<{ shipmentId: string }>
}) {
    const { shipmentId } = use(params)
    const { data, isLoading, error } = useShipmentById(shipmentId)
    const updateShipment = useUpdateShipment()
    const { canWrite, canWriteShipmentType } = usePermissions()
    const [selectedInvoiceLineIds, setSelectedInvoiceLineIds] = useState<
        string[]
    >([])
    const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)

    if (isLoading) return <ShipmentLoading />
    if (error) return <ErrorPage message={error.message} />
    if (!data) {
        return (
            <ErrorPage
                title="Shipment not found"
                message="Unable to load this shipment."
            />
        )
    }

    const sellings: ShipmentLinkedSelling[] = data.sellings ?? []
    const linkedCostings = linkedCostingsFromBreakdowns(data.costingBreakdowns)
    const linkedLines = data.costingBreakdowns ?? []
    const invoicableLines = linkedLines.filter(isInvoicableBreakdown)
    const invoicableIds = invoicableLines.map((line) => line.id)
    const allInvoicableSelected =
        invoicableIds.length > 0 &&
        invoicableIds.every((id) => selectedInvoiceLineIds.includes(id))
    const someInvoicableSelected =
        invoicableIds.some((id) => selectedInvoiceLineIds.includes(id)) &&
        !allInvoicableSelected
    const operational = data.shipmentOperational
    const containers = operational?.shipmentOperationalContainers ?? []
    const attachments = data.shipmentOperationalAttachments ?? []
    const hasOperational = operational !== null

    const createOperationalForm = (
        <ShipmentOperationalForm
            mode="create"
            id={undefined}
            shipmentId={data.id}
            shipmentType={undefined}
            portDepartureId={undefined}
            portDestinationId={undefined}
            loadingLocationId={undefined}
            unloadingLocationId={undefined}
            blNumber={undefined}
            bookingNumber={undefined}
            truckingBookToId={undefined}
            freightBookToId={undefined}
            remarks={undefined}
            customerCodeId={data.customerCodeId}
            customerShipperId={data.customerShipperId}
            vesselId={undefined}
            eta={undefined}
            loadingInAt={undefined}
            loadingOutAt={undefined}
        />
    )

    const editOperationalForm = operational ? (
        <ShipmentOperationalForm
            mode="edit"
            id={operational.id}
            shipmentId={data.id}
            orderNumber={data.orderNumber}
            status={data.status}
            isActive={data.isActive}
            shipmentType={operational.shipmentType}
            portDepartureId={operational.portDepartureId ?? undefined}
            portDestinationId={operational.portDestinationId ?? undefined}
            loadingLocationId={operational.loadingLocationId ?? undefined}
            unloadingLocationId={operational.unloadingLocationId ?? undefined}
            blNumber={operational.blNumber ?? undefined}
            bookingNumber={operational.bookingNumber ?? undefined}
            truckingBookToId={operational.truckingBookToId ?? undefined}
            freightBookToId={operational.freightBookToId ?? undefined}
            remarks={operational.remarks ?? undefined}
            truckingBookTo={operational.truckingBookTo}
            freightBookTo={operational.freightBookTo}
            customerCodeId={data.customerCodeId}
            customerShipperId={data.customerShipperId}
            vesselId={operational.vesselId}
            eta={operational.eta ?? undefined}
            loadingInAt={operational.loadingInAt ?? undefined}
            loadingOutAt={operational.loadingOutAt ?? undefined}
        />
    ) : null

    const totalVendorCost = linkedCostings.reduce(
        (acc: number, costing) => acc + costingNetAmount(costing),
        0
    )
    const totalCustomerCharge = linkedLines.reduce(
        (acc, line) => acc + costingSellingLineNet(line),
        0
    )
    const grossProfit = totalCustomerCharge - totalVendorCost
    const margin =
        totalCustomerCharge > 0 ? (grossProfit / totalCustomerCharge) * 100 : null

    const firstContainerNumber = containers[0]?.containerNumber
    const canEditStatus = operational?.shipmentType
        ? canWriteShipmentType(operational.shipmentType)
        : canWrite("shipments")

    return (
        <DashboardPage atmosphere>
            <div className="mb-6">
                <Button asChild variant="ghost" className="text-muted-foreground">
                    <Link href="/dashboard/shipments">
                        <IconArrowLeft className="size-5" />
                        Back to shipments
                    </Link>
                </Button>
            </div>

            <section className={cn(glassPanel, "relative overflow-hidden")}>
                <div aria-hidden className={glassShine} />

                <div className="relative space-y-8 p-6 lg:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 items-start gap-4 sm:gap-5">
                            <div
                                className={cn(
                                    glassInset,
                                    "flex size-14 shrink-0 items-center justify-center sm:size-16"
                                )}
                            >
                                <IconShip className="size-8 text-[var(--mli-primary-container)] sm:size-9" />
                            </div>

                            <div className="min-w-0 space-y-3">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h1 className="text-headline-lg tracking-tight">
                                            {data.orderNumber}
                                        </h1>
                                        <ShipmentLifecycleChip status={data.status} />
                                        {hasOperational ? (
                                            <ShipmentTypeTag
                                                type={operational.shipmentType}
                                                className="px-3 py-1 text-xs font-semibold tracking-[0.05em]"
                                            />
                                        ) : (
                                            <TbdChip />
                                        )}
                                    </div>
                                    <p
                                        className={cn(
                                            "font-mono text-sm font-medium tracking-wide",
                                            brandText
                                        )}
                                    >
                                        {data.customerCode.customerName} (
                                        {data.customerCode.customerCode})
                                    </p>
                                </div>

                                <p className="flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
                                    <span>
                                        Shipper {data.customerShipper?.name ?? "—"}
                                    </span>
                                    {hasOperational ? (
                                        <>
                                            <Dot className="hidden size-4 sm:inline" />
                                            <span>
                                                Updated{" "}
                                                {localDate(operational.updatedAt)}{" "}
                                                by {operational.updatedBy.name}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Dot className="hidden size-4 sm:inline" />
                                            <span>Operational details not set up yet</span>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-start gap-3 lg:items-end">
                            {canEditStatus ? (
                                <div className="w-full min-w-[160px] sm:w-44">
                                    <p className="mb-1.5 text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase lg:text-right">
                                        Status
                                    </p>
                                    <ShipmentStatusControl
                                        value={data.status}
                                        disabled={updateShipment.isPending}
                                        onValueChange={(status: ShipmentStatus) => {
                                            updateShipment.mutate({
                                                id: data.id,
                                                shipment: { status },
                                            })
                                        }}
                                    />
                                </div>
                            ) : null}
                            {hasOperational ? (
                                <>
                                    <div className="flex flex-wrap gap-2 lg:justify-end">
                                        <CountPill>
                                            {containers.length} container
                                            {containers.length === 1 ? "" : "s"}
                                        </CountPill>
                                        <CountPill>
                                            {attachments.length} document
                                            {attachments.length === 1 ? "" : "s"}
                                        </CountPill>
                                        {COSTING_MODULE_ENABLED ? (
                                            <CountPill>
                                                {linkedCostings.length} costing
                                                {linkedCostings.length === 1 ? "" : "s"}
                                            </CountPill>
                                        ) : null}
                                        {SELLING_MODULE_ENABLED ? (
                                            <CountPill>
                                                {sellings.length} selling
                                                {sellings.length === 1 ? "" : "s"}
                                            </CountPill>
                                        ) : null}
                                    </div>
                                    {editOperationalForm}
                                </>
                            ) : null}
                        </div>
                    </div>

                    {hasOperational ? (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <MetricTile
                                label="Origin"
                                value={formatPort(operational.portDeparture) ?? "—"}
                                hint="Port of loading"
                            />
                            <MetricTile
                                label="Destination"
                                value={formatPort(operational.portDestination) ?? "—"}
                                hint="Port of discharge"
                            />
                            <MetricTile
                                label="Vessel"
                                value={`${operational.vessel.vesselName} / ${operational.vessel.voyageNumber}`}
                                hint="Assigned vessel & voyage"
                            />
                            <MetricTile
                                label="ETA"
                                value={
                                    operational.eta
                                        ? formatCalendarDate(operational.eta)
                                        : "—"
                                }
                                hint={
                                    firstContainerNumber
                                        ? `${containers.length} container${containers.length === 1 ? "" : "s"}`
                                        : "No containers yet"
                                }
                            />
                        </div>
                    ) : null}
                </div>
            </section>

            {!hasOperational ? (
                <div className="mt-8">
                    <DashboardPageCard>
                        <EmptyState
                            icon={IconRoute}
                            title="Add shipment operational details"
                            description={operationalSetupDescription()}
                            action={createOperationalForm}
                        />
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 px-4 pb-2">
                            {SETUP_STEPS.map((step, index) => (
                                <span
                                    key={step}
                                    className="flex items-center gap-2 text-xs text-muted-foreground"
                                >
                                    {index > 0 ? (
                                        <span
                                            aria-hidden
                                            className="text-muted-foreground/50"
                                        >
                                            →
                                        </span>
                                    ) : null}
                                    <span className="rounded-md bg-[rgba(214,227,255,0.35)] px-2.5 py-1 font-medium">
                                        {step}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </DashboardPageCard>
                </div>
            ) : (
                <div className="mt-8 space-y-6">
                        <DashboardPageCard>
                            <SectionIntro
                                title="Shipment overview"
                                description="Core route, party, and reference details for this order."
                            />
                            <div className="grid gap-6 sm:grid-cols-2">
                                <OverviewField label="Order number">
                                    <span className={cn("font-mono tracking-wide", brandText)}>
                                        {data.orderNumber}
                                    </span>
                                </OverviewField>
                                <OverviewField label="Customer">
                                    {data.customerCode.customerName} (
                                    {data.customerCode.customerCode})
                                </OverviewField>
                                <OverviewField label="Shipper">
                                    {data.customerShipper?.name ?? "—"}
                                </OverviewField>
                                <OverviewField label="Assigned vessel">
                                    {operational.vessel.vesselName} /{" "}
                                    {operational.vessel.voyageNumber}
                                </OverviewField>
                                <OverviewField label="Origin port">
                                    {formatPort(operational.portDeparture) ?? (
                                        <WarningChip>Unavailable</WarningChip>
                                    )}
                                </OverviewField>
                                <OverviewField label="Destination port">
                                    {formatPort(operational.portDestination) ?? (
                                        <WarningChip>Unavailable</WarningChip>
                                    )}
                                </OverviewField>
                                <OverviewField label="BL number">
                                    {operational.blNumber ? (
                                        operational.blNumber
                                    ) : (
                                        <WarningChip>Unavailable</WarningChip>
                                    )}
                                </OverviewField>
                                <OverviewField label="Booking number">
                                    {operational.bookingNumber ? (
                                        operational.bookingNumber
                                    ) : (
                                        <WarningChip>Unavailable</WarningChip>
                                    )}
                                </OverviewField>
                                <OverviewField label="Trucking book to">
                                    {operational.truckingBookTo ? (
                                        `${operational.truckingBookTo.vendorName} (${operational.truckingBookTo.vendorCode})`
                                    ) : (
                                        <WarningChip>Unavailable</WarningChip>
                                    )}
                                </OverviewField>
                                <OverviewField label="Freight book to">
                                    {operational.freightBookTo ? (
                                        `${operational.freightBookTo.vendorName} (${operational.freightBookTo.vendorCode})`
                                    ) : (
                                        <WarningChip>Unavailable</WarningChip>
                                    )}
                                </OverviewField>
                                <OverviewField label="ETA">
                                    {operational.eta ? (
                                        formatCalendarDate(operational.eta)
                                    ) : (
                                        <WarningChip>Unavailable</WarningChip>
                                    )}
                                </OverviewField>
                                <OverviewField label="Loading in at">
                                    {operational.loadingInAt ? (
                                        formatCalendarDate(operational.loadingInAt)
                                    ) : (
                                        <WarningChip>Unavailable</WarningChip>
                                    )}
                                </OverviewField>
                                <OverviewField label="Loading out at">
                                    {operational.loadingOutAt ? (
                                        formatCalendarDate(operational.loadingOutAt)
                                    ) : (
                                        <WarningChip>Unavailable</WarningChip>
                                    )}
                                </OverviewField>
                                <OverviewField
                                    label="Remarks"
                                    className="sm:col-span-2"
                                >
                                    {operational.remarks ? (
                                        <span className="whitespace-pre-wrap font-normal">
                                            {operational.remarks}
                                        </span>
                                    ) : (
                                        <WarningChip>Unavailable</WarningChip>
                                    )}
                                </OverviewField>
                            </div>
                        </DashboardPageCard>

                        {COSTING_MODULE_ENABLED ? (
                        <DashboardPageCard>
                            <SectionIntro
                                title="Linked costings"
                                description="Vendor cost lines on this shipment. Select lines with selling amounts to create a customer invoice with remarks."
                                action={
                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                        {SELLING_MODULE_ENABLED &&
                                        selectedInvoiceLineIds.length > 0 ? (
                                            <PermissionGate
                                                resource="sellings"
                                                write
                                            >
                                                <>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            setSelectedInvoiceLineIds(
                                                                []
                                                            )
                                                        }
                                                    >
                                                        Clear selection
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        className="gap-2"
                                                        onClick={() => {
                                                            const invalid =
                                                                selectedInvoiceLineIds.filter(
                                                                    (id) =>
                                                                        !invoicableIds.includes(
                                                                            id
                                                                        )
                                                                )
                                                            if (
                                                                invalid.length >
                                                                0
                                                            ) {
                                                                toast.error(
                                                                    "Selected lines need a selling amount and must not already be invoiced."
                                                                )
                                                                return
                                                            }
                                                            setInvoiceDialogOpen(
                                                                true
                                                            )
                                                        }}
                                                    >
                                                        <IconFileInvoice className="size-4" />
                                                        Create invoice (
                                                        {
                                                            selectedInvoiceLineIds.length
                                                        }
                                                        )
                                                    </Button>
                                                </>
                                            </PermissionGate>
                                        ) : null}
                                        <LinkShipmentCostingForm
                                            shipmentId={data.id}
                                            orderNumber={data.orderNumber}
                                        />
                                    </div>
                                }
                            />
                            {SELLING_MODULE_ENABLED ? (
                                <CreateSellingInvoiceForm
                                    shipmentId={data.id}
                                    orderNumber={data.orderNumber}
                                    breakdowns={linkedLines}
                                    open={invoiceDialogOpen}
                                    onOpenChange={(next) => {
                                        setInvoiceDialogOpen(next)
                                        if (!next) {
                                            setSelectedInvoiceLineIds([])
                                        }
                                    }}
                                    preselectedIds={selectedInvoiceLineIds}
                                />
                            ) : null}
                            {linkedCostings.length === 0 ? (
                                <EmptyState
                                    icon={IconReceipt}
                                    title="No linked costings"
                                    description="Link an existing costing to include vendor costs in this shipment’s financial summary."
                                    action={
                                        <LinkShipmentCostingForm
                                            shipmentId={data.id}
                                            orderNumber={data.orderNumber}
                                        />
                                    }
                                />
                            ) : (
                                <div className={tableShell}>
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[56rem] text-left">
                                        <thead>
                                            <tr className={tableHeaderRow}>
                                                {SELLING_MODULE_ENABLED ? (
                                                    <th
                                                        className={cn(
                                                            tableHeaderCell,
                                                            "w-10"
                                                        )}
                                                    >
                                                        <Checkbox
                                                            checked={
                                                                allInvoicableSelected
                                                                    ? true
                                                                    : someInvoicableSelected
                                                                      ? "indeterminate"
                                                                      : false
                                                            }
                                                            disabled={
                                                                invoicableIds.length ===
                                                                0
                                                            }
                                                            onCheckedChange={(
                                                                value
                                                            ) => {
                                                                setSelectedInvoiceLineIds(
                                                                    value ===
                                                                        true
                                                                        ? invoicableIds
                                                                        : []
                                                                )
                                                            }}
                                                            aria-label="Select all invoicable lines"
                                                        />
                                                    </th>
                                                ) : null}
                                                <th className={tableHeaderCell}>
                                                    Costing / invoice
                                                </th>
                                                <th className={tableHeaderCell}>Line</th>
                                                <th className={tableHeaderCell}>
                                                    Net amount
                                                </th>
                                                <th className={tableHeaderCell}>
                                                    Amount + VAT
                                                </th>
                                                <th className={tableHeaderCell}>
                                                    VAT
                                                </th>
                                                <th className={tableHeaderCell}>
                                                    PPH23
                                                </th>
                                                <th className={tableHeaderCell}>
                                                    Selling amt
                                                </th>
                                                <th className={tableHeaderCell}>
                                                    Selling net
                                                </th>
                                                <th className={tableHeaderCell} />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {linkedCostings.map((costing) => {
                                                const lines = costing.linkedLines
                                                const rowSpan = lines.length

                                                return lines.map((line, index) => {
                                                    const lineNet =
                                                        costingShipmentLineNet(line)
                                                    const amountPlusVat =
                                                        costingLineUnitPlusPpn(line)
                                                    const sellingNet =
                                                        costingSellingLineNet(line)
                                                    const sellingVat =
                                                        Number(
                                                            line.sellingVatPercentage
                                                        ) || 0
                                                    const sellingPph =
                                                        Number(
                                                            line.sellingPph23Percentage
                                                        ) || 0
                                                    const sellingAmount =
                                                        Number(line.sellingAmount) || 0
                                                    const isFirst = index === 0
                                                    const canInvoice =
                                                        isInvoicableBreakdown(line)
                                                    const isSelected =
                                                        selectedInvoiceLineIds.includes(
                                                            line.id
                                                        )

                                                    return (
                                                        <tr
                                                            key={line.id}
                                                            className={tableRowClass}
                                                        >
                                                            {SELLING_MODULE_ENABLED ? (
                                                                <td
                                                                    className={
                                                                        tableCellClass
                                                                    }
                                                                >
                                                                    <Checkbox
                                                                        checked={
                                                                            isSelected
                                                                        }
                                                                        disabled={
                                                                            !canInvoice
                                                                        }
                                                                        title={
                                                                            canInvoice
                                                                                ? "Select for customer invoice"
                                                                                : line.sellingId
                                                                                  ? "Already on a customer invoice"
                                                                                  : "Set a selling amount first"
                                                                        }
                                                                        onCheckedChange={(
                                                                            value
                                                                        ) => {
                                                                            setSelectedInvoiceLineIds(
                                                                                (
                                                                                    prev
                                                                                ) => {
                                                                                    if (
                                                                                        value ===
                                                                                        true
                                                                                    ) {
                                                                                        return prev.includes(
                                                                                            line.id
                                                                                        )
                                                                                            ? prev
                                                                                            : [
                                                                                                  ...prev,
                                                                                                  line.id,
                                                                                              ]
                                                                                    }
                                                                                    return prev.filter(
                                                                                        (
                                                                                            id
                                                                                        ) =>
                                                                                            id !==
                                                                                            line.id
                                                                                    )
                                                                                }
                                                                            )
                                                                        }}
                                                                        aria-label={`Select ${line.productDescription ?? "line"}`}
                                                                    />
                                                                </td>
                                                            ) : null}
                                                            {isFirst ? (
                                                                <td
                                                                    className={
                                                                        tableCellClass
                                                                    }
                                                                    rowSpan={rowSpan}
                                                                >
                                                                    <div className="space-y-1.5">
                                                                        <Link
                                                                            href={`/dashboard/costings/${costing.id}`}
                                                                            className={
                                                                                brandLink
                                                                            }
                                                                        >
                                                                            {
                                                                                costing.costingNumber
                                                                            }
                                                                        </Link>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {costing
                                                                                .vendor
                                                                                ?.vendorName ??
                                                                                "—"}
                                                                        </p>
                                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                                            <VendorInvoiceTypeChip
                                                                                type={
                                                                                    costing.vendorInvoiceType
                                                                                }
                                                                            />
                                                                            <span className="text-xs text-muted-foreground">
                                                                                {costing.vendorInvoiceNumber ||
                                                                                    "—"}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            ) : null}
                                                            <td
                                                                className={
                                                                    tableCellClass
                                                                }
                                                            >
                                                                {line.productDescription ??
                                                                    "—"}
                                                            </td>
                                                            <td
                                                                className={cn(
                                                                    tableCellClass,
                                                                    "font-medium"
                                                                )}
                                                            >
                                                                {formatIdr(lineNet)}
                                                            </td>
                                                            <td
                                                                className={cn(
                                                                    tableCellClass,
                                                                    "font-medium"
                                                                )}
                                                            >
                                                                {formatIdr(amountPlusVat)}
                                                            </td>
                                                            <td
                                                                className={
                                                                    tableCellClass
                                                                }
                                                            >
                                                                {sellingVat}%
                                                            </td>
                                                            <td
                                                                className={
                                                                    tableCellClass
                                                                }
                                                            >
                                                                {sellingPph}%
                                                            </td>
                                                            <td
                                                                className={
                                                                    tableCellClass
                                                                }
                                                            >
                                                                {formatIdr(
                                                                    sellingAmount
                                                                )}
                                                            </td>
                                                            <td
                                                                className={cn(
                                                                    tableCellClass,
                                                                    "font-medium"
                                                                )}
                                                            >
                                                                {formatIdr(sellingNet)}
                                                            </td>
                                                            <td
                                                                className={
                                                                    tableCellClass
                                                                }
                                                            >
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <PermissionGate
                                                                        resource="costings"
                                                                        write
                                                                    >
                                                                        <ShipmentCostingBreakdownTaxForm
                                                                            costingId={
                                                                                costing.id
                                                                            }
                                                                            breakdownId={
                                                                                line.id
                                                                            }
                                                                            productDescription={
                                                                                line.productDescription ??
                                                                                "Line item"
                                                                            }
                                                                            sellingAmount={
                                                                                line.sellingAmount
                                                                            }
                                                                            sellingVatPercentage={
                                                                                line.sellingVatPercentage
                                                                            }
                                                                            sellingPph23Percentage={
                                                                                line.sellingPph23Percentage
                                                                            }
                                                                        />
                                                                    </PermissionGate>
                                                                    <UnlinkShipmentCostingButton
                                                                        costingId={
                                                                            costing.id
                                                                        }
                                                                        costingNumber={
                                                                            costing.costingNumber
                                                                        }
                                                                        shipmentId={
                                                                            data.id
                                                                        }
                                                                        breakdownId={
                                                                            line.id
                                                                        }
                                                                        lineLabel={
                                                                            line.productDescription ??
                                                                            "this line"
                                                                        }
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            })}
                                        </tbody>
                                        </table>
                                    </div>
                                    <div className="flex flex-wrap justify-end gap-x-6 gap-y-1 border-t border-[rgba(214,227,255,0.35)] px-4 py-3">
                                        <p className="text-sm text-muted-foreground">
                                            Vendor payable:{" "}
                                            <span className="font-semibold text-foreground">
                                                {formatIdr(totalVendorCost)}
                                            </span>
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Customer charge:{" "}
                                            <span className="font-semibold text-foreground">
                                                {formatIdr(totalCustomerCharge)}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </DashboardPageCard>
                        ) : null}

                        <DashboardPageCard>
                            <SectionIntro
                                title="Container details"
                                description="Container numbers, seals, sizes, and types linked to this shipment."
                                action={
                                    <PermissionGate
                                        resource="shipments"
                                        write
                                        shipmentType={operational.shipmentType}
                                    >
                                        <ShipmentContainerForm
                                            mode="create"
                                            containerNumber={undefined}
                                            sealNumber={undefined}
                                            containerSizeId={undefined}
                                            containerTypeId={undefined}
                                            shipmentOperationalId={operational.id}
                                            shipmentId={data.id}
                                            id={undefined}
                                        />
                                    </PermissionGate>
                                }
                            />
                            {containers.length === 0 ? (
                                <EmptyState
                                    icon={IconBox}
                                    title="No containers yet"
                                    description="Add container numbers and seal details once equipment is assigned."
                                    action={
                                        <PermissionGate
                                            resource="shipments"
                                            write
                                            shipmentType={operational.shipmentType}
                                        >
                                            <ShipmentContainerForm
                                                mode="create"
                                                containerNumber={undefined}
                                                sealNumber={undefined}
                                                containerSizeId={undefined}
                                                containerTypeId={undefined}
                                                shipmentOperationalId={operational.id}
                                                shipmentId={data.id}
                                                id={undefined}
                                            />
                                        </PermissionGate>
                                    }
                                />
                            ) : (
                                <div className={cn(tableShell, "overflow-x-auto")}>
                                    <table className="w-full min-w-[40rem] text-left">
                                        <thead>
                                            <tr className={tableHeaderRow}>
                                                <th className={tableHeaderCell}>
                                                    Container number
                                                </th>
                                                <th className={tableHeaderCell}>
                                                    Seal number
                                                </th>
                                                <th className={tableHeaderCell}>Size</th>
                                                <th className={tableHeaderCell}>Type</th>
                                                <th className={tableHeaderCell}>
                                                    Last modified by
                                                </th>
                                                <th className={tableHeaderCell}>
                                                    Last modified at
                                                </th>
                                                <th className={tableHeaderCell} />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {containers.map(
                                                (
                                                    container: ShipmentOperationalContainer
                                                ) => (
                                                    <tr
                                                        key={container.id}
                                                        className={tableRowClass}
                                                    >
                                                        <td className={tableCellClass}>
                                                            {container.containerNumber || "—"}
                                                        </td>
                                                        <td className={tableCellClass}>
                                                            {container.sealNumber || "—"}
                                                        </td>
                                                        <td className={tableCellClass}>
                                                            {formatContainerLookup(container.containerSize)}
                                                        </td>
                                                        <td className={tableCellClass}>
                                                            {formatContainerLookup(container.containerType)}
                                                        </td>
                                                        <td className={tableCellClass}>
                                                            {container.updatedBy.name}
                                                        </td>
                                                        <td className={tableCellClass}>
                                                            {localDate(container.updatedAt)}
                                                        </td>
                                                        <td className={tableCellClass}>
                                                            <PermissionGate
                                                                resource="shipments"
                                                                write
                                                                shipmentType={
                                                                    operational.shipmentType
                                                                }
                                                            >
                                                                <ShipmentContainerForm
                                                                    mode="edit"
                                                                    containerNumber={
                                                                        container.containerNumber ??
                                                                        undefined
                                                                    }
                                                                    sealNumber={
                                                                        container.sealNumber ??
                                                                        undefined
                                                                    }
                                                                    containerSizeId={
                                                                        container.containerSizeId ??
                                                                        container.containerSize?.id
                                                                    }
                                                                    containerTypeId={
                                                                        container.containerTypeId ??
                                                                        container.containerType?.id
                                                                    }
                                                                    shipmentOperationalId={
                                                                        operational.id
                                                                    }
                                                                    shipmentId={data.id}
                                                                    id={container.id}
                                                                />
                                                            </PermissionGate>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </DashboardPageCard>

                        <DashboardPageCard>
                            <SectionIntro
                                title="Document uploads"
                                description="Supporting files attached to this shipment."
                                action={
                                    <PermissionGate
                                        resource="shipments"
                                        write
                                        shipmentType={operational.shipmentType}
                                    >
                                        <DocumentUploadForm
                                            mode="create"
                                            module="shipment"
                                            shipmentId={data.id}
                                            costingId={undefined}
                                            id={undefined}
                                            attachmentName={undefined}
                                            document={undefined}
                                        />
                                    </PermissionGate>
                                }
                            />
                            {attachments.length === 0 ? (
                                <EmptyState
                                    icon={IconFile}
                                    title="No documents yet"
                                    description="Upload bills of lading, invoices, or other supporting files for this shipment."
                                    action={
                                        <PermissionGate
                                            resource="shipments"
                                            write
                                            shipmentType={operational.shipmentType}
                                        >
                                            <DocumentUploadForm
                                                mode="create"
                                                module="shipment"
                                                shipmentId={data.id}
                                                costingId={undefined}
                                                id={undefined}
                                                attachmentName={undefined}
                                                document={undefined}
                                            />
                                        </PermissionGate>
                                    }
                                />
                            ) : (
                                <div className="space-y-3">
                                    {attachments.map(
                                        (attachment: ShipmentOperationalAttachment) => (
                                            <div
                                                key={attachment.id}
                                                className={cn(
                                                    glassInset,
                                                    "flex items-center justify-between gap-3 px-4 py-3"
                                                )}
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className={metadataIconWell}>
                                                        <IconFile className="size-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-foreground">
                                                            {attachment.attachmentName}
                                                            <span className="text-muted-foreground">
                                                                {" "}
                                                                — {attachment.fileName}
                                                            </span>
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Last modified{" "}
                                                            {localDate(attachment.updatedAt)}{" "}
                                                            by {attachment.updatedBy.name}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => {
                                                            void shipmentsService
                                                                .viewShipmentOperationalAttachment(
                                                                    data.id,
                                                                    attachment.id!
                                                                )
                                                                .catch((err: unknown) => {
                                                                    toast.error(
                                                                        err instanceof Error
                                                                            ? err.message
                                                                            : "Unable to open attachment"
                                                                    )
                                                                })
                                                        }}
                                                    >
                                                        <IconEye className="size-4 text-muted-foreground" />
                                                    </Button>
                                                    <PermissionGate
                                                        resource="shipments"
                                                        write
                                                        shipmentType={
                                                            operational.shipmentType
                                                        }
                                                    >
                                                        <DocumentUploadForm
                                                            mode="edit"
                                                            module="shipment"
                                                            shipmentId={data.id}
                                                            costingId={undefined}
                                                            id={attachment.id}
                                                            attachmentName={
                                                                attachment.attachmentName
                                                            }
                                                            document={undefined}
                                                        />
                                                    </PermissionGate>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </DashboardPageCard>

                        {SELLING_MODULE_ENABLED ? (
                        <DashboardPageCard>
                            <SectionIntro
                                title="Customer invoices"
                                description="Customer invoices created from this shipment. Each invoice has its own profit."
                                action={
                                    <PermissionGate resource="sellings" write>
                                        <CreateSellingInvoiceForm
                                            shipmentId={data.id}
                                            orderNumber={data.orderNumber}
                                            breakdowns={linkedLines}
                                        />
                                    </PermissionGate>
                                }
                            />
                            {sellings.length === 0 ? (
                                <EmptyState
                                    icon={IconTags}
                                    title="No customer invoices"
                                    description="Create an invoice from uninvoiced costing lines that already have selling amounts."
                                    action={
                                        <PermissionGate resource="sellings" write>
                                            <CreateSellingInvoiceForm
                                                shipmentId={data.id}
                                                orderNumber={data.orderNumber}
                                                breakdowns={linkedLines}
                                            />
                                        </PermissionGate>
                                    }
                                />
                            ) : (
                                <div className={tableShell}>
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[48rem] text-left">
                                            <thead>
                                                <tr className={tableHeaderRow}>
                                                    <th className={tableHeaderCell}>
                                                        Invoice #
                                                    </th>
                                                    <th className={tableHeaderCell}>
                                                        Lines
                                                    </th>
                                                    <th className={tableHeaderCell}>
                                                        Net amount (Rp)
                                                    </th>
                                                    <th className={tableHeaderCell}>
                                                        Profit
                                                    </th>
                                                    <th className={tableHeaderCell}>
                                                        Status
                                                    </th>
                                                    <th className={tableHeaderCell}>
                                                        Invoice date
                                                    </th>
                                                    <th className={tableHeaderCell}>
                                                        Updated
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sellings.map(
                                                    (selling: ShipmentLinkedSelling) => {
                                                        const lineCount =
                                                            selling.costingBreakdowns
                                                                ?.length ?? 0
                                                        const lines =
                                                            selling.costingBreakdowns ??
                                                            []
                                                        const net = lines.reduce(
                                                            (sum, line) =>
                                                                sum +
                                                                costingSellingLineNet(
                                                                    line
                                                                ),
                                                            0
                                                        )
                                                        const profit =
                                                            invoiceProfit(lines)
                                                        return (
                                                            <tr
                                                                key={selling.id}
                                                                className={tableRowClass}
                                                            >
                                                                <td
                                                                    className={
                                                                        tableCellClass
                                                                    }
                                                                >
                                                                    <Link
                                                                        href={`/dashboard/sellings/${selling.id}`}
                                                                        className={
                                                                            brandLink
                                                                        }
                                                                    >
                                                                        {
                                                                            selling.sellingNumber
                                                                        }
                                                                    </Link>
                                                                </td>
                                                                <td
                                                                    className={
                                                                        tableCellClass
                                                                    }
                                                                >
                                                                    {lineCount}
                                                                </td>
                                                                <td
                                                                    className={cn(
                                                                        tableCellClass,
                                                                        "font-medium"
                                                                    )}
                                                                >
                                                                    {formatIdr(net)}
                                                                </td>
                                                                <td
                                                                    className={cn(
                                                                        tableCellClass,
                                                                        "font-medium tabular-nums",
                                                                        profit >= 0
                                                                            ? "text-secondary-foreground"
                                                                            : "text-[var(--mli-on-error-container)]"
                                                                    )}
                                                                >
                                                                    {formatIdr(profit)}
                                                                </td>
                                                                <td
                                                                    className={
                                                                        tableCellClass
                                                                    }
                                                                >
                                                                    <SellingStatusChip
                                                                        status={
                                                                            selling.status
                                                                        }
                                                                    />
                                                                </td>
                                                                <td
                                                                    className={
                                                                        tableCellClass
                                                                    }
                                                                >
                                                                    {selling.invoiceDate
                                                                        ? localDate(
                                                                              selling.invoiceDate
                                                                          )
                                                                        : "—"}
                                                                </td>
                                                                <td
                                                                    className={cn(
                                                                        tableCellClass,
                                                                        "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {selling.updatedAt
                                                                        ? localDate(
                                                                              selling.updatedAt
                                                                          )
                                                                        : "—"}
                                                                </td>
                                                            </tr>
                                                        )
                                                    }
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex flex-wrap justify-end gap-x-6 gap-y-1 border-t border-[rgba(214,227,255,0.35)] px-4 py-3">
                                        <p className="text-sm text-muted-foreground">
                                            Issued invoice total (net):{" "}
                                            <span className="font-semibold text-foreground">
                                                {formatIdr(
                                                    sellings
                                                        .filter(
                                                            (selling) =>
                                                                selling.status !==
                                                                "DRAFT"
                                                        )
                                                        .reduce(
                                                            (sum, selling) =>
                                                                sum +
                                                                (
                                                                    selling.costingBreakdowns ??
                                                                    []
                                                                ).reduce(
                                                                    (
                                                                        lineSum,
                                                                        line
                                                                    ) =>
                                                                        lineSum +
                                                                        costingSellingLineNet(
                                                                            line
                                                                        ),
                                                                    0
                                                                ),
                                                            0
                                                        )
                                                )}
                                            </span>
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Invoice profit:{" "}
                                            <span className="font-semibold text-foreground">
                                                {formatIdr(
                                                    sellings.reduce(
                                                        (sum, selling) =>
                                                            sum +
                                                            invoiceProfit(
                                                                selling.costingBreakdowns ??
                                                                    []
                                                            ),
                                                        0
                                                    )
                                                )}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </DashboardPageCard>
                        ) : null}

                        {FINANCIAL_MODULES_ENABLED ? (
                        <DashboardPageCard>
                            <SectionIntro
                                title="Financial summary"
                                description="Margin from linked costings and customer charges."
                            />
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {COSTING_MODULE_ENABLED ? (
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                                            Vendor payable
                                        </p>
                                        <p className="text-base font-semibold tabular-nums text-[var(--mli-on-error-container)]">
                                            − {formatIdr(totalVendorCost)}
                                        </p>
                                    </div>
                                ) : null}
                                {COSTING_MODULE_ENABLED || SELLING_MODULE_ENABLED ? (
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                                            Customer charge
                                        </p>
                                        <p className="text-base font-semibold tabular-nums">
                                            {formatIdr(totalCustomerCharge)}
                                        </p>
                                    </div>
                                ) : null}
                                {COSTING_MODULE_ENABLED ? (
                                    <>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                                                Gross profit
                                            </p>
                                            <p
                                                className={cn(
                                                    "text-base font-semibold tabular-nums",
                                                    grossProfit >= 0
                                                        ? "text-secondary-foreground"
                                                        : "text-[var(--mli-on-error-container)]"
                                                )}
                                            >
                                                {formatIdr(grossProfit)}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                                                Margin
                                            </p>
                                            <p className="text-base font-semibold tabular-nums">
                                                {margin === null ? (
                                                    <WarningChip>Unavailable</WarningChip>
                                                ) : (
                                                    `${margin.toFixed(2)}%`
                                                )}
                                            </p>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </DashboardPageCard>
                        ) : null}
                </div>
            )}
        </DashboardPage>
    )
}

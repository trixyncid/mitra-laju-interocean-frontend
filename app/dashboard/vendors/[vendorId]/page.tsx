"use client"

import { use } from "react"
import Link from "next/link"
import {
    IconArrowLeft,
    IconChartBar,
    IconFerry,
    IconReceipt,
    IconShip,
} from "@tabler/icons-react"
import { Dot } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusChip } from "@/components/ui/status-chip"
import { VendorMetadataCard } from "@/components/vendor-metadata-card"
import { VendorNetworkPanel } from "@/components/vendor-network-panel"
import VendorForm from "@/components/forms/vendor-form"
import ErrorPage from "@/components/error-page"
import CustomerVendorDetailLoading from "@/components/loading/customer-vendor-detail-loading"
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
import { MasterDataWriteGate } from "@/components/write-gates"
import { useVendorById } from "@/hooks/use-vendors"
import {
    glassInset,
    glassPanel,
    glassShine,
    glassTabCount,
    glassTabsTrigger,
} from "@/lib/design"
import { FINANCIAL_MODULES_ENABLED } from "@/lib/feature-flags"
import { ShipmentTypeTags } from "@/components/ui/shipment-type-tag"
import { amountCalculation, cn, localDate } from "@/lib/utils"
import { Costing } from "../../costings/columns"
import ShipmentHistoryPage from "./(shipments)/shipment-history-page"
import { LinkedShipment } from "./(shipments)/shipment-columns"
import CostingHistoryPage from "./(costings)/costing-history-page"
import MonthlySummary, {
    type VendorMonthlySummaryRow,
} from "./(summary)/monthly-summary"

type VendorContact = {
    id: string
    contactName: string
    phoneNumber: string
    email: string
    isActive: boolean
}

type VendorLocation = {
    id: string
    addressLine1: string
    addressLine2: string
    addressLine3: string
    city: string
    province: string
    country: string
    postalCode: string
    vendorContacts: VendorContact[]
    updatedAt: string
    updatedBy?: { name: string }
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
}: {
    title: string
    description: string
}) {
    return (
        <div className="mb-6 space-y-1">
            <h2 className="text-headline-md font-semibold tracking-tight">{title}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
    )
}

function EmptyState({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
}) {
    return (
        <div className={cn(glassInset, "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center")}>
            <div className="flex size-12 items-center justify-center rounded-md bg-[rgba(214,227,255,0.45)] text-[var(--mli-primary-container)]">
                <Icon className="size-6" />
            </div>
            <div className="space-y-1">
                <p className="font-semibold text-foreground">{title}</p>
                <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
            </div>
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

export default function VendorDetailPage({ params }: { params: Promise<{ vendorId: string }> }) {
    const { vendorId } = use(params)
    const { data, isLoading, error } = useVendorById(vendorId)

    if (error) {
        return (
            <ErrorPage
                title="Vendor Detail Not Found"
                message="Vendor detail not found. Please check the vendor ID and try again."
            />
        )
    }
    if (isLoading) return <CustomerVendorDetailLoading />
    if (!data) return <ErrorPage title="Vendor not found" message="Unable to load this vendor." />

    const updatedByName =
        typeof data.updatedBy === "string" ? data.updatedBy : data.updatedBy?.name
    const costings = Array.isArray(data.costings) ? data.costings : []
    const vendorLocations: VendorLocation[] = Array.isArray(data.vendorLocations)
        ? data.vendorLocations
        : []

    const totalVendorContacts = vendorLocations.reduce(
        (total, location) =>
            total + (Array.isArray(location.vendorContacts) ? location.vendorContacts.length : 0),
        0
    )

    const vendorCostings = costings.map((costing: Costing) => ({
        id: costing.id,
        invoiceNumber: costing.vendorInvoiceNumber,
        amount: amountCalculation(
            costing.price,
            costing.currency,
            costing.vatPercentage,
            costing.pph23Percentage
        ),
        shipmentOrderNumber: costing.shipment?.orderNumber ?? "",
        updatedAt: costing.updatedAt ?? "",
    }))

    const monthlyMap = new Map<string, VendorMonthlySummaryRow>()

    const monthLabel = (year: number, month: number) =>
        new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
            new Date(year, month, 1)
        )

    for (const costing of costings) {
        const date = new Date(costing.createdAt ?? costing.updatedAt ?? "")
        if (Number.isNaN(date.getTime())) continue

        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        let row = monthlyMap.get(key)
        if (!row) {
            row = {
                key,
                label: monthLabel(date.getFullYear(), date.getMonth()),
                costingCount: 0,
                costingTotal: 0,
                paidTotal: 0,
                unpaidTotal: 0,
            }
            monthlyMap.set(key, row)
        }

        const amount = amountCalculation(
            costing.price,
            costing.currency,
            costing.vatPercentage,
            costing.pph23Percentage
        )
        row.costingCount += 1
        row.costingTotal += amount
        if (costing.status === "PAID") {
            row.paidTotal += amount
        } else {
            row.unpaidTotal += amount
        }
    }

    const monthlySummary = Array.from(monthlyMap.values()).sort((a, b) =>
        b.key.localeCompare(a.key)
    )

    const vendorShipments: LinkedShipment[] = costings
        .filter((costing: Costing) => costing.shipment != null)
        .map((costing: Costing) => {
            const shipment = costing.shipment!
            return {
                id: shipment.id ?? "",
                eta: shipment.shipmentOperational?.eta ?? "",
                orderNumber: shipment.orderNumber ?? "",
                customerCode: shipment.customerCode?.customerCode ?? "",
                customerShipper: shipment.customerShipper?.name ?? "",
                departureCountry: shipment.shipmentOperational?.portDeparture?.portCountry ?? "",
                arrivalCountry: shipment.shipmentOperational?.portDestination?.portCountry ?? "",
                status: shipment.status,
            }
        })
        .filter(
            (shipment: LinkedShipment, index: number, self: LinkedShipment[]) =>
                self.findIndex((s: LinkedShipment) => s.id === shipment.id) === index
        )

    const calculateYTDSpend = () => {
        const year = new Date().getFullYear()
        let total = 0
        for (const costing of costings) {
            const created = new Date(costing.createdAt ?? costing.updatedAt ?? "")
            if (!Number.isNaN(created.getTime()) && created.getFullYear() === year) {
                total += amountCalculation(
                    costing.price,
                    costing.currency,
                    costing.vatPercentage,
                    costing.pph23Percentage
                )
            }
        }
        return total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
    }

    const totalActiveShipments = () => {
        return costings.filter((costing: Costing) => costing.shipment?.status === "ONGOING").length
    }

    const calculateOutstandingBills = () => {
        let total = 0
        for (const costing of costings) {
            if (costing.status !== "PAID") {
                total += amountCalculation(
                    costing.price,
                    costing.currency,
                    costing.vatPercentage,
                    costing.pph23Percentage
                )
            }
        }
        return total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
    }

    return (
        <DashboardPage atmosphere>
            <div className="mb-6">
                <Button asChild variant="ghost" className="text-muted-foreground">
                    <Link href="/dashboard/vendors">
                        <IconArrowLeft className="size-5" />
                        Back to vendors
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
                                <IconFerry className="size-8 text-[var(--mli-primary-container)] sm:size-9" />
                            </div>

                            <div className="min-w-0 space-y-3">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h1 className="text-headline-lg tracking-tight">
                                            {data.vendorName}
                                        </h1>
                                        <StatusChip active={Boolean(data?.isActive)} />
                                        <ShipmentTypeTags types={data.shipmentTypes} />
                                    </div>
                                    <p className="font-mono text-sm font-medium tracking-wide text-[var(--mli-primary-container)]">
                                        {data.vendorCode}
                                    </p>
                                </div>

                                <p className="flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
                                    <span>
                                        Updated {localDate(data.updatedAt)}
                                        {updatedByName ? ` by ${updatedByName}` : ""}
                                    </span>
                                    <Dot className="hidden size-4 sm:inline" />
                                    <span>Registered {localDate(data.createdAt)}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                            <CountPill>
                                {vendorLocations.length} office
                                {vendorLocations.length === 1 ? "" : "s"}
                            </CountPill>
                            <CountPill>
                                {totalVendorContacts} contact
                                {totalVendorContacts === 1 ? "" : "s"}
                            </CountPill>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricTile
                            label="Active shipments"
                            value={totalActiveShipments()}
                            hint="Currently in progress"
                        />
                        {FINANCIAL_MODULES_ENABLED ? (
                            <>
                                <MetricTile
                                    label="Total assignments"
                                    value={costings.length}
                                    hint="All linked costings"
                                />
                                <MetricTile
                                    label="YTD spend"
                                    value={calculateYTDSpend()}
                                    hint="Costings this year"
                                />
                                <MetricTile
                                    label="Outstanding bills"
                                    value={calculateOutstandingBills()}
                                    hint="Unpaid vendor invoices"
                                />
                            </>
                        ) : null}
                    </div>
                </div>
            </section>

            <Tabs defaultValue="details" className="mt-8 gap-0">
                <div className="overflow-x-auto pb-1">
                    <TabsList className="h-auto min-w-max rounded-md border border-[rgba(214,227,255,0.45)] bg-[rgba(232,238,246,0.55)] p-1 backdrop-blur-xl">
                        <TabsTrigger value="details" className={glassTabsTrigger}>
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="offices-and-contacts" className={glassTabsTrigger}>
                            Network
                            <span className={glassTabCount}>{vendorLocations.length}</span>
                        </TabsTrigger>
                        <TabsTrigger value="shipment-history" className={glassTabsTrigger}>
                            Shipments
                            <span className={glassTabCount}>{vendorShipments.length}</span>
                        </TabsTrigger>
                        {FINANCIAL_MODULES_ENABLED ? (
                            <>
                                <TabsTrigger value="costings" className={glassTabsTrigger}>
                                    Costings
                                    <span className={glassTabCount}>{costings.length}</span>
                                </TabsTrigger>
                                <TabsTrigger value="summary" className={glassTabsTrigger}>
                                    Summary
                                    <span className={glassTabCount}>{monthlySummary.length}</span>
                                </TabsTrigger>
                            </>
                        ) : null}
                    </TabsList>
                </div>

                <TabsContent value="details" className="mt-6">
                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
                        <aside className="lg:sticky lg:top-6">
                            <VendorMetadataCard vendor={data} />
                        </aside>
                        <DashboardPageCard>
                            <MasterDataWriteGate
                                fallback={
                                    <div className="space-y-2">
                                        <h2 className="text-headline-md font-semibold">
                                            Vendor details
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            You can view this vendor profile, but you do not have
                                            permission to edit it.
                                        </p>
                                    </div>
                                }
                            >
                                <VendorForm mode="edit" vendor={data} />
                            </MasterDataWriteGate>
                        </DashboardPageCard>
                    </div>
                </TabsContent>

                <TabsContent value="offices-and-contacts" className="mt-6">
                    <DashboardPageCard>
                        <VendorNetworkPanel
                            vendorId={vendorId}
                            locations={vendorLocations}
                            totalContacts={totalVendorContacts}
                        />
                    </DashboardPageCard>
                </TabsContent>

                <TabsContent value="shipment-history" className="mt-6">
                    <DashboardPageCard>
                        <SectionIntro
                            title="Shipment history"
                            description={
                                FINANCIAL_MODULES_ENABLED
                                    ? "Shipments linked through this vendor’s costings, including routes and ETAs."
                                    : "Shipments linked to this vendor, including routes and ETAs."
                            }
                        />
                        {vendorShipments.length === 0 ? (
                            <EmptyState
                                icon={IconShip}
                                title="No shipments yet"
                                description={
                                    FINANCIAL_MODULES_ENABLED
                                        ? "Shipments tied to this vendor’s costings will appear here."
                                        : "Shipments tied to this vendor will appear here."
                                }
                            />
                        ) : (
                            <ShipmentHistoryPage vendorShipments={vendorShipments} />
                        )}
                    </DashboardPageCard>
                </TabsContent>

                {FINANCIAL_MODULES_ENABLED ? (
                <>
                <TabsContent value="costings" className="mt-6">
                    <DashboardPageCard>
                        <SectionIntro
                            title="Costing history"
                            description="Vendor invoices and amounts linked to this vendor."
                        />
                        {costings.length === 0 ? (
                            <EmptyState
                                icon={IconReceipt}
                                title="No costings yet"
                                description="Costings assigned to this vendor will show up in this list."
                            />
                        ) : (
                            <CostingHistoryPage
                                vendorName={data.vendorName}
                                vendorCostings={vendorCostings}
                            />
                        )}
                    </DashboardPageCard>
                </TabsContent>

                <TabsContent value="summary" className="mt-6">
                    <DashboardPageCard>
                        <SectionIntro
                            title="Monthly summary"
                            description="Costings grouped by transaction month, with paid and unpaid totals."
                        />
                        {monthlySummary.length === 0 ? (
                            <EmptyState
                                icon={IconChartBar}
                                title="No transactions yet"
                                description="Monthly totals will appear once this vendor has costings."
                            />
                        ) : (
                            <MonthlySummary rows={monthlySummary} />
                        )}
                    </DashboardPageCard>
                </TabsContent>
                </>
                ) : null}
            </Tabs>
        </DashboardPage>
    )
}

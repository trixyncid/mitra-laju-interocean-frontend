"use client"

import { use } from "react"
import Link from "next/link"
import {
    IconArrowLeft,
    IconBuildingFactory2,
    IconCash,
    IconChartBar,
    IconReceipt,
    IconShip,
} from "@tabler/icons-react"
import { Dot } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusChip } from "@/components/ui/status-chip"
import { CustomerMetadataCard } from "@/components/customer-metadata-card"
import { CustomerNetworkPanel } from "@/components/customer-network-panel"
import CustomerForm from "@/components/forms/customer-form"
import ErrorPage from "@/components/error-page"
import CustomerVendorDetailLoading from "@/components/loading/customer-vendor-detail-loading"
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
import { MasterDataWriteGate } from "@/components/write-gates"
import { useCustomerById } from "@/hooks/use-customers"
import {
    glassInset,
    glassPanel,
    glassShine,
    glassTabCount,
    glassTabsTrigger,
} from "@/lib/design"
import { FINANCIAL_MODULES_ENABLED } from "@/lib/feature-flags"
import { ShipmentTypeTags } from "@/components/ui/shipment-type-tag"
import { amountCalculation, cn, localDate, sellingNetAmount } from "@/lib/utils"
import type { CustomerShipment } from "@/lib/types/entity-details"
import { Costing } from "@/app/dashboard/costings/columns"
import ShipmentHistoryPage from "./(shipments)/shipment-history-page"
import type { LinkedShipment } from "./(shipments)/shipment-columns"
import CostingHistoryPage from "./(costings)/costing-history-page"
import { Costing as CustomerCosting } from "./(costings)/costing-column"
import SellingHistoryPage from "./(sellings)/selling-history-page"
import type { CustomerSelling } from "./(sellings)/selling-column"
import MonthlySummary, {
    type MonthlySummaryRow,
} from "./(summary)/monthly-summary"

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

export default function CustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) {
    const { customerId } = use(params)
    const { data, isLoading, error } = useCustomerById(customerId)

    if (error) {
        return (
            <ErrorPage
                title="Customer Detail Not Found"
                message="Customer detail not found. Please check the customer ID and try again."
            />
        )
    }
    if (isLoading) return <CustomerVendorDetailLoading />
    if (!data) return <ErrorPage title="Customer not found" message="Unable to load this customer." />

    const updatedByName =
        typeof data.updatedBy === "string" ? data.updatedBy : data.updatedBy?.name

    const customerShippers = Array.isArray(data.customerShippers) ? data.customerShippers : []
    const shipments = Array.isArray(data.shipments) ? data.shipments : []

    const totalCustomerLocations = customerShippers.reduce(
        (total, shipper) =>
            total + (Array.isArray(shipper.customerLocations) ? shipper.customerLocations.length : 0),
        0
    )

    const totalCustomerContacts = customerShippers.reduce(
        (total, shipper) =>
            total +
            (Array.isArray(shipper.customerLocations) ? shipper.customerLocations : []).reduce(
                (locTotal, location) =>
                    locTotal +
                    (Array.isArray(location.customerContacts) ? location.customerContacts.length : 0),
                0
            ),
        0
    )

    const customerShipments: LinkedShipment[] = shipments.map((shipment: CustomerShipment) => ({
        id: shipment.id,
        orderNumber: shipment.orderNumber,
        customerCode: `${shipment.customerCode?.customerName ?? ""} (${shipment.customerCode?.customerCode ?? ""})`,
        customerShipper: shipment.customerShipper?.name ?? "",
        departurePort: shipment.shipmentOperational?.portDeparture?.portName ?? "",
        arrivalPort: shipment.shipmentOperational?.portDestination?.portName ?? "",
        eta: shipment.shipmentOperational?.eta?.split("T")[0] ?? "",
        status: shipment.status,
        costingTotal: (shipment.costings ?? []).reduce(
            (sum, costing) =>
                sum +
                amountCalculation(
                    costing.price,
                    costing.currency,
                    costing.vatPercentage,
                    costing.pph23Percentage
                ),
            0
        ),
        sellingTotal: (shipment.sellings ?? []).reduce(
            (sum, selling) =>
                sum +
                sellingNetAmount(
                    Number(selling.amount) || 0,
                    Number(selling.vatPercentage) || 0,
                    Number(selling.pph23Percentage) || 0
                ),
            0
        ),
    }))

    const customerCostings: CustomerCosting[] = []
    const customerSellings: CustomerSelling[] = []
    const monthlyMap = new Map<string, MonthlySummaryRow>()

    const monthLabel = (year: number, month: number) =>
        new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
            new Date(year, month, 1)
        )

    const ensureMonth = (dateStr: string) => {
        const date = new Date(dateStr)
        if (Number.isNaN(date.getTime())) return null
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        let row = monthlyMap.get(key)
        if (!row) {
            row = {
                key,
                label: monthLabel(date.getFullYear(), date.getMonth()),
                sellingCount: 0,
                sellingTotal: 0,
                costingCount: 0,
                costingTotal: 0,
                netTotal: 0,
            }
            monthlyMap.set(key, row)
        }
        return row
    }

    for (const shipment of shipments) {
        for (const costing of shipment.costings ?? []) {
            const amount = amountCalculation(
                costing.price,
                costing.currency,
                costing.vatPercentage,
                costing.pph23Percentage
            )
            customerCostings.push({
                id: costing.id,
                invoiceNumber: costing.vendorInvoiceNumber,
                amount,
                shipmentOrderNumber: costing.shipment?.orderNumber ?? shipment.orderNumber ?? "",
                updatedAt: costing.updatedAt ?? "",
            })

            const month = ensureMonth(costing.createdAt ?? costing.updatedAt ?? "")
            if (month) {
                month.costingCount += 1
                month.costingTotal += amount
                month.netTotal -= amount
            }
        }

        for (const selling of shipment.sellings ?? []) {
            const amount = sellingNetAmount(
                Number(selling.amount) || 0,
                Number(selling.vatPercentage) || 0,
                Number(selling.pph23Percentage) || 0
            )
            customerSellings.push({
                id: selling.id,
                sellingNumber: selling.sellingNumber,
                description: selling.description,
                amount,
                shipmentOrderNumber: selling.shipment?.orderNumber ?? shipment.orderNumber ?? "",
                status: selling.status,
                updatedAt: selling.updatedAt ?? "",
            })

            const month = ensureMonth(selling.createdAt ?? selling.updatedAt ?? "")
            if (month) {
                month.sellingCount += 1
                month.sellingTotal += amount
                month.netTotal += amount
            }
        }
    }

    const monthlySummary = Array.from(monthlyMap.values()).sort((a, b) =>
        b.key.localeCompare(a.key)
    )

    const calculateYTDSpend = () => {
        const year = new Date().getFullYear()
        let total = 0
        for (const shipment of shipments) {
            total += (shipment.costings ?? []).reduce((acc: number, costing: Costing) => {
                const created = new Date(costing.createdAt ?? costing.updatedAt ?? "")
                if (!Number.isNaN(created.getTime()) && created.getFullYear() === year) {
                    return (
                        acc +
                        amountCalculation(
                            costing.price,
                            costing.currency,
                            costing.vatPercentage,
                            costing.pph23Percentage
                        )
                    )
                }
                return acc
            }, 0)
        }
        return total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
    }

    const calculateOutstandingBills = () => {
        let total = 0
        for (const selling of customerSellings) {
            if (selling.status !== "PAID") {
                total += selling.amount
            }
        }
        return total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
    }

    const activeShipmentsCount = shipments.filter(
        (shipment: CustomerShipment) => shipment.status === "ONGOING"
    ).length
    const costingsTotal = customerCostings.length
    const sellingsTotal = customerSellings.length

    return (
        <DashboardPage atmosphere>
            <div className="mb-6">
                <Button asChild variant="ghost" className="text-muted-foreground">
                    <Link href="/dashboard/customers">
                        <IconArrowLeft className="size-5" />
                        Back to customers
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
                                <IconBuildingFactory2 className="size-8 text-[var(--mli-primary-container)] sm:size-9" />
                            </div>

                            <div className="min-w-0 space-y-3">
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h1 className="text-headline-lg tracking-tight">
                                            {data.customerName}
                                        </h1>
                                        <StatusChip active={Boolean(data?.isActive)} />
                                        <ShipmentTypeTags types={data.shipmentTypes} />
                                    </div>
                                    <p className="font-mono text-sm font-medium tracking-wide text-[var(--mli-primary-container)]">
                                        {data.customerCode}
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
                                {customerShippers.length} shipper
                                {customerShippers.length === 1 ? "" : "s"}
                            </CountPill>
                            <CountPill>
                                {totalCustomerLocations} location
                                {totalCustomerLocations === 1 ? "" : "s"}
                            </CountPill>
                            <CountPill>
                                {totalCustomerContacts} contact
                                {totalCustomerContacts === 1 ? "" : "s"}
                            </CountPill>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricTile
                            label="Active shipments"
                            value={activeShipmentsCount}
                            hint="Currently in progress"
                        />
                        <MetricTile
                            label="Total assignments"
                            value={shipments.length}
                            hint="All linked shipments"
                        />
                        {FINANCIAL_MODULES_ENABLED ? (
                            <>
                                <MetricTile
                                    label="YTD spend"
                                    value={calculateYTDSpend()}
                                    hint="Costings this year"
                                />
                                <MetricTile
                                    label="Outstanding bills"
                                    value={calculateOutstandingBills()}
                                    hint="Unpaid customer charges"
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
                        <TabsTrigger value="locations-and-contacts" className={glassTabsTrigger}>
                            Network
                            <span className={glassTabCount}>{customerShippers.length}</span>
                        </TabsTrigger>
                        <TabsTrigger value="shipment-history" className={glassTabsTrigger}>
                            Shipments
                            <span className={glassTabCount}>{shipments.length}</span>
                        </TabsTrigger>
                        {FINANCIAL_MODULES_ENABLED ? (
                            <>
                                <TabsTrigger value="sellings" className={glassTabsTrigger}>
                                    Sellings
                                    <span className={glassTabCount}>{sellingsTotal}</span>
                                </TabsTrigger>
                                <TabsTrigger value="costings" className={glassTabsTrigger}>
                                    Costings
                                    <span className={glassTabCount}>{costingsTotal}</span>
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
                            <CustomerMetadataCard customer={data} />
                        </aside>
                        <DashboardPageCard>
                            <MasterDataWriteGate
                                fallback={
                                    <div className="space-y-2">
                                        <h2 className="text-headline-md font-semibold">
                                            Customer details
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            You can view this customer profile, but you do not have
                                            permission to edit it.
                                        </p>
                                    </div>
                                }
                            >
                                <CustomerForm mode="edit" customer={data} />
                            </MasterDataWriteGate>
                        </DashboardPageCard>
                    </div>
                </TabsContent>

                <TabsContent value="locations-and-contacts" className="mt-6">
                    <DashboardPageCard>
                        <CustomerNetworkPanel
                            customerId={data.id}
                            shippers={customerShippers}
                            totalLocations={totalCustomerLocations}
                            totalContacts={totalCustomerContacts}
                        />
                    </DashboardPageCard>
                </TabsContent>

                <TabsContent value="shipment-history" className="mt-6">
                    <DashboardPageCard>
                        <SectionIntro
                            title="Shipment history"
                            description="All shipments linked to this customer, including routes and ETAs."
                        />
                        {shipments.length === 0 ? (
                            <EmptyState
                                icon={IconShip}
                                title="No shipments yet"
                                description="Shipments assigned to this customer will appear here."
                            />
                        ) : (
                            <ShipmentHistoryPage customerShipments={customerShipments} />
                        )}
                    </DashboardPageCard>
                </TabsContent>

                {FINANCIAL_MODULES_ENABLED ? (
                <>
                <TabsContent value="sellings" className="mt-6">
                    <DashboardPageCard>
                        <SectionIntro
                            title="Selling history"
                            description="Customer charges and invoices tied to this customer’s shipments."
                        />
                        {sellingsTotal === 0 ? (
                            <EmptyState
                                icon={IconCash}
                                title="No sellings yet"
                                description="Sellings from linked shipments will show up in this list."
                            />
                        ) : (
                            <SellingHistoryPage customerSellings={customerSellings} />
                        )}
                    </DashboardPageCard>
                </TabsContent>

                <TabsContent value="costings" className="mt-6">
                    <DashboardPageCard>
                        <SectionIntro
                            title="Costing history"
                            description="Vendor invoices and amounts tied to this customer’s shipments."
                        />
                        {costingsTotal === 0 ? (
                            <EmptyState
                                icon={IconReceipt}
                                title="No costings yet"
                                description="Costings from linked shipments will show up in this list."
                            />
                        ) : (
                            <CostingHistoryPage
                                customerName={data.customerName ?? ""}
                                customerCostings={customerCostings}
                            />
                        )}
                    </DashboardPageCard>
                </TabsContent>

                <TabsContent value="summary" className="mt-6">
                    <DashboardPageCard>
                        <SectionIntro
                            title="Monthly summary"
                            description="Sellings and costings grouped by transaction month, with net margin per month."
                        />
                        {monthlySummary.length === 0 ? (
                            <EmptyState
                                icon={IconChartBar}
                                title="No transactions yet"
                                description="Monthly totals will appear once this customer has sellings or costings."
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

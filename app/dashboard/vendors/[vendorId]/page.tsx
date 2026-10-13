"use client"

import { use, useState } from "react"
import {
    IconAlertCircle,
    IconBuildingWarehouse,
    IconCalendarPlus,
    IconChartBar,
    IconCircleCheck,
    IconClock,
    IconFileCertificate,
    IconPencil,
    IconReceipt,
} from "@tabler/icons-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusChip, WarningChip } from "@/components/ui/status-chip"
import { RecordLink } from "@/components/record-link"
import { HeroFact, HeroStat, ProfileHero } from "@/components/directory/profile-hero"
import { RecordFacts } from "@/components/directory/record-facts"
import { formatIdr, formatIdrCompact } from "@/components/dashboard/overview-card"
import { VendorNetworkPanel } from "@/components/vendor-network-panel"
import VendorForm from "@/components/forms/vendor-form"
import ErrorPage from "@/components/error-page"
import CustomerVendorDetailLoading from "@/components/loading/customer-vendor-detail-loading"
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
import { MasterDataWriteGate } from "@/components/write-gates"
import { useVendorById } from "@/hooks/use-vendors"
import { glassInset, glassTabCount, glassTabsTrigger } from "@/lib/design"
import { VENDOR_INVOICE_MODULE_ENABLED } from "@/lib/feature-flags"
import { ShipmentTypeTags } from "@/components/ui/shipment-type-tag"
import { cn, vendorInvoiceInvoiceTotals, localDate } from "@/lib/utils"
import { VendorInvoice } from "../../vendor-invoices/columns"

import VendorInvoiceHistoryPage from "./(vendor-invoices)/vendor-invoice-history-page"
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
            <div className="flex size-12 items-center justify-center rounded-md bg-[rgba(var(--mli-tint-rgb),0.45)] text-[var(--mli-primary-container)]">
                <Icon className="size-6" />
            </div>
            <div className="space-y-1">
                <p className="font-semibold text-foreground">{title}</p>
                <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    )
}


export default function VendorDetailPage({ params }: { params: Promise<{ vendorId: string }> }) {
    const { vendorId } = use(params)
    const { data, isLoading, error } = useVendorById(vendorId)
    const [tab, setTab] = useState("details")

    if (error) {
        return (
            <ErrorPage
                title="Vendor not found"
                message="We could not find this vendor. Check the link and try again."
            />
        )
    }
    if (isLoading) return <CustomerVendorDetailLoading />
    if (!data) return <ErrorPage title="Vendor not found" message="We could not load this vendor." />

    const updatedByName =
        typeof data.updatedBy === "string" ? data.updatedBy : data.updatedBy?.name
    const vendorInvoices: VendorInvoice[] = Array.isArray(data.vendorInvoices)
        ? data.vendorInvoices
        : []
    const vendorLocations: VendorLocation[] = Array.isArray(data.vendorLocations)
        ? data.vendorLocations
        : []

    const totalVendorContacts = vendorLocations.reduce(
        (total, location) =>
            total + (Array.isArray(location.vendorContacts) ? location.vendorContacts.length : 0),
        0
    )

    const vendorVendorInvoices = vendorInvoices.map((vendorInvoice) => ({
        id: vendorInvoice.id,
        invoiceNumber: vendorInvoice.vendorInvoiceNumber ?? "",
        amount: vendorInvoiceInvoiceTotals(
            vendorInvoice.vendorInvoiceBreakdowns ?? []
        ).net,
        updatedAt: vendorInvoice.updatedAt ?? "",
    }))

    const monthlyMap = new Map<string, VendorMonthlySummaryRow>()

    const monthLabel = (year: number, month: number) =>
        new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
            new Date(year, month, 1)
        )

    for (const vendorInvoice of vendorInvoices) {
        const date = new Date(vendorInvoice.createdAt ?? vendorInvoice.updatedAt ?? "")
        if (Number.isNaN(date.getTime())) continue

        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        let row = monthlyMap.get(key)
        if (!row) {
            row = {
                key,
                label: monthLabel(date.getFullYear(), date.getMonth()),
                vendorInvoiceCount: 0,
                vendorInvoiceTotal: 0,
                paidTotal: 0,
                unpaidTotal: 0,
            }
            monthlyMap.set(key, row)
        }

        const amount = vendorInvoiceInvoiceTotals(
            vendorInvoice.vendorInvoiceBreakdowns ?? []
        ).net
        row.vendorInvoiceCount += 1
        row.vendorInvoiceTotal += amount
        if (vendorInvoice.status === "PAID") {
            row.paidTotal += amount
        } else {
            row.unpaidTotal += amount
        }
    }

    const monthlySummary = Array.from(monthlyMap.values()).sort((a, b) =>
        b.key.localeCompare(a.key)
    )

    const calculateYTDSpend = () => {
        const year = new Date().getFullYear()
        let total = 0
        for (const vendorInvoice of vendorInvoices) {
            const created = new Date(vendorInvoice.createdAt ?? vendorInvoice.updatedAt ?? "")
            if (!Number.isNaN(created.getTime()) && created.getFullYear() === year) {
                total += vendorInvoiceInvoiceTotals(
                    vendorInvoice.vendorInvoiceBreakdowns ?? []
                ).net
            }
        }
        return total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
    }


    const amountOf = (invoice: VendorInvoice) =>
        vendorInvoiceInvoiceTotals(invoice.vendorInvoiceBreakdowns ?? []).net
    const unpaidInvoices = vendorInvoices.filter((invoice) => invoice.status !== "PAID")
    const paidInvoices = vendorInvoices.filter((invoice) => invoice.status === "PAID")
    const unpaidAmount = unpaidInvoices.reduce((sum, invoice) => sum + amountOf(invoice), 0)
    const paidAmount = paidInvoices.reduce((sum, invoice) => sum + amountOf(invoice), 0)
    const invoiceDate = (invoice: VendorInvoice) =>
        invoice.vendorInvoiceDate ?? invoice.createdAt ?? invoice.updatedAt ?? ""
    const recentInvoices = [...vendorInvoices]
        .sort((a, b) => invoiceDate(b).localeCompare(invoiceDate(a)))
        .slice(0, 5)

    const openEditor = () => {
        setTab("details")
        window.setTimeout(
            () => document.getElementById("vendor-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }),
            50
        )
    }

    return (
        <DashboardPage atmosphere>
            <ProfileHero
                tone="supplier"
                backHref="/dashboard/vendors"
                backLabel="All vendors"
                name={data.vendorName}
                code={data.vendorCode}
                badges={
                    <>
                        <StatusChip active={Boolean(data?.isActive)} />
                        <ShipmentTypeTags types={data.shipmentTypes} />
                    </>
                }
                facts={
                    <>
                        <HeroFact icon={IconBuildingWarehouse}>
                            {vendorLocations.length} office{vendorLocations.length === 1 ? "" : "s"} ·{" "}
                            {totalVendorContacts} contact{totalVendorContacts === 1 ? "" : "s"}
                        </HeroFact>
                        <HeroFact icon={IconFileCertificate}>
                            {data.npwp ? `NPWP ${data.npwp}` : "No tax ID yet"}
                        </HeroFact>
                    </>
                }
                actions={
                    <MasterDataWriteGate>
                        <button
                            type="button"
                            onClick={openEditor}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-[#14456f] shadow-elev-1 transition-transform hover:-translate-y-0.5"
                        >
                            <IconPencil className="size-3.5" />
                            Edit details
                        </button>
                    </MasterDataWriteGate>
                }
                aside={
                    VENDOR_INVOICE_MODULE_ENABLED ? (
                        <div className="rounded-2xl bg-[linear-gradient(135deg,#0f2f57,#14456f)] p-4 text-white shadow-elev-2 ring-4 ring-card">
                            <p className="text-xs text-white/70">We still owe this vendor</p>
                            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                                {formatIdr(unpaidAmount)}
                            </p>
                            <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-white/15">
                                <span
                                    className="h-full rounded-full bg-[#7dd3c0]"
                                    style={{
                                        width: `${paidAmount + unpaidAmount > 0 ? (paidAmount / (paidAmount + unpaidAmount)) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                            <p className="mt-1.5 flex justify-between text-[11px] text-white/70">
                                <span>Paid {formatIdrCompact(paidAmount)}</span>
                                <span>Unpaid {formatIdrCompact(unpaidAmount)}</span>
                            </p>
                        </div>
                    ) : null
                }
            >
                {VENDOR_INVOICE_MODULE_ENABLED ? (
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <HeroStat
                            label="Invoices"
                            value={vendorInvoices.length}
                            hint="From this vendor"
                            icon={IconReceipt}
                        />
                        <HeroStat
                            label="Not paid yet"
                            value={unpaidInvoices.length}
                            hint={formatIdr(unpaidAmount)}
                            icon={IconAlertCircle}
                        />
                        <HeroStat
                            label="Paid"
                            value={paidInvoices.length}
                            hint={formatIdr(paidAmount)}
                            icon={IconCircleCheck}
                        />
                        <HeroStat
                            label="Spent this year"
                            value={calculateYTDSpend()}
                            hint="All invoices this year"
                            icon={IconChartBar}
                        />
                    </div>
                ) : null}
            </ProfileHero>

            <Tabs value={tab} onValueChange={setTab} className="mt-8 gap-0">
                <div className="overflow-x-auto pb-1">
                    <TabsList className="h-auto min-w-max rounded-full border border-border bg-card p-1">
                        <TabsTrigger value="details" className={glassTabsTrigger}>
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="offices-and-contacts" className={glassTabsTrigger}>
                            Network
                            <span className={glassTabCount}>{vendorLocations.length}</span>
                        </TabsTrigger>
                        {VENDOR_INVOICE_MODULE_ENABLED ? (
                            <>
                                <TabsTrigger value="vendor-invoices" className={glassTabsTrigger}>
                                    Vendor invoices
                                    <span className={glassTabCount}>{vendorInvoices.length}</span>
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
                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                        <DashboardPageCard>
                            <div id="vendor-editor" className="scroll-mt-24" />
                            <MasterDataWriteGate
                                fallback={
                                    <div className="space-y-2">
                                        <h2 className="text-headline-md font-semibold">Vendor details</h2>
                                        <p className="text-sm text-muted-foreground">
                                            You can see this vendor, but you cannot change it.
                                        </p>
                                    </div>
                                }
                            >
                                <VendorForm mode="edit" vendor={data} />
                            </MasterDataWriteGate>
                        </DashboardPageCard>
                        <aside className="space-y-4 lg:sticky lg:top-24">
                            {VENDOR_INVOICE_MODULE_ENABLED ? (
                                <div className="rounded-2xl surface p-5">
                                    <div className="flex items-center justify-between gap-2">
                                        <h2 className="text-sm font-semibold text-foreground">Latest invoices</h2>
                                        <button
                                            type="button"
                                            onClick={() => setTab("vendor-invoices")}
                                            className="cursor-pointer text-xs font-medium text-primary hover:underline"
                                        >
                                            See all
                                        </button>
                                    </div>
                                    {recentInvoices.length === 0 ? (
                                        <p className="mt-4 text-sm text-muted-foreground">No invoices yet.</p>
                                    ) : (
                                        <ol className="relative mt-4 space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-border">
                                            {recentInvoices.map((invoice) => {
                                                const paid = invoice.status === "PAID"
                                                return (
                                                    <li key={invoice.id} className="relative pl-6">
                                                        <span
                                                            aria-hidden
                                                            className={cn(
                                                                "absolute top-1.5 left-0 size-[11px] rounded-full ring-4 ring-card",
                                                                paid ? "bg-[var(--mli-positive)]" : "bg-[#e3a13b]"
                                                            )}
                                                        />
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <RecordLink
                                                                    module="VENDOR_INVOICE"
                                                                    href={`/dashboard/vendor-invoices?invoice=${invoice.id}`}
                                                                    className="block truncate font-mono text-xs font-medium text-foreground hover:underline"
                                                                >
                                                                    {invoice.vendorInvoiceNumber}
                                                                </RecordLink>
                                                                <p className="text-[11px] text-muted-foreground">
                                                                    {localDate(invoiceDate(invoice))} · {paid ? "Paid" : "Not paid yet"}
                                                                </p>
                                                            </div>
                                                            <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                                                                {formatIdrCompact(amountOf(invoice))}
                                                            </span>
                                                        </div>
                                                    </li>
                                                )
                                            })}
                                        </ol>
                                    )}
                                </div>
                            ) : null}
                            <RecordFacts
                                title="About this record"
                                rows={[
                                    { icon: IconCalendarPlus, label: "Added on", value: localDate(data.createdAt) },
                                    {
                                        icon: IconClock,
                                        label: "Last change",
                                        value: `${localDate(data.updatedAt)}${updatedByName ? ` by ${updatedByName}` : ""}`,
                                    },
                                    {
                                        icon: IconFileCertificate,
                                        label: "Tax ID (NPWP)",
                                        value: data.npwp ? (
                                            <span className="font-mono">{data.npwp}</span>
                                        ) : (
                                            <WarningChip>Not added yet</WarningChip>
                                        ),
                                    },
                                ]}
                            />
                        </aside>
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

                {VENDOR_INVOICE_MODULE_ENABLED ? (
                <>
                <TabsContent value="vendor-invoices" className="mt-6">
                    <DashboardPageCard>
                        <SectionIntro
                            title="Vendor invoice history"
                            description="Vendor invoices and amounts from this vendor."
                        />
                        {vendorInvoices.length === 0 ? (
                            <EmptyState
                                icon={IconReceipt}
                                title="No vendor invoices yet"
                                description="Vendor invoices from this vendor will show up in this list."
                            />
                        ) : (
                            <VendorInvoiceHistoryPage
                                vendorName={data.vendorName}
                                vendorVendorInvoices={vendorVendorInvoices}
                            />
                        )}
                    </DashboardPageCard>
                </TabsContent>

                <TabsContent value="summary" className="mt-6">
                    <DashboardPageCard>
                        <SectionIntro
                            title="Monthly summary"
                            description="Vendor invoices grouped by transaction month, with paid and unpaid totals."
                        />
                        {monthlySummary.length === 0 ? (
                            <EmptyState
                                icon={IconChartBar}
                                title="No transactions yet"
                                description="Monthly totals will appear once this vendor has vendor invoices."
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

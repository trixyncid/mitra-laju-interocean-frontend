"use client"

import { use, useState } from "react"
import {
    IconAddressBook,
    IconCalendarPlus,
    IconCash,
    IconClock,
    IconFileCertificate,
    IconMapPin,
    IconPencil,
    IconRoute,
    IconShip,
    IconUsersGroup,
} from "@tabler/icons-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusChip, WarningChip } from "@/components/ui/status-chip"
import { ShipmentTypeTags } from "@/components/ui/shipment-type-tag"
import { CustomerNetworkPanel } from "@/components/customer-network-panel"
import CustomerForm from "@/components/forms/customer-form"
import ErrorPage from "@/components/error-page"
import CustomerVendorDetailLoading from "@/components/loading/customer-vendor-detail-loading"
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
import { MasterDataWriteGate } from "@/components/write-gates"
import { HeroFact, HeroStat, MixBar, ProfileHero } from "@/components/directory/profile-hero"
import { RecordFacts } from "@/components/directory/record-facts"
import { ShipmentRouteCards } from "@/components/directory/shipment-route-cards"
import { updatedByName } from "@/components/directory/primitives"
import { useCustomerById } from "@/hooks/use-customers"
import { glassInset, glassTabCount, glassTabsTrigger } from "@/lib/design"
import { LEGACY_INVOICE_SCREENS_ENABLED } from "@/lib/feature-flags"
import { cn, localDate } from "@/lib/utils"
import { shipmentReference } from "@/lib/shipment-reference"
import SellingHistoryPage from "./(sellings)/selling-history-page"
import type { CustomerSelling } from "./(sellings)/selling-column"

function SectionIntro({ title, description }: { title: string; description: string }) {
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
            <div className="flex size-12 items-center justify-center rounded-full bg-card text-primary shadow-elev-1">
                <Icon className="size-6" />
            </div>
            <div className="space-y-1">
                <p className="font-semibold text-foreground">{title}</p>
                <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    )
}

export default function CustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) {
    const { customerId } = use(params)
    const { data, isLoading, error } = useCustomerById(customerId)
    const [tab, setTab] = useState("details")

    if (error) {
        return (
            <ErrorPage
                title="Customer not found"
                message="We could not find this customer. Check the link and try again."
            />
        )
    }
    if (isLoading) return <CustomerVendorDetailLoading />
    if (!data) return <ErrorPage title="Customer not found" message="We could not load this customer." />

    const updatedBy = updatedByName(data.updatedBy)
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

    const customerSellings: CustomerSelling[] = shipments.flatMap((shipment) =>
        (shipment.sellings ?? []).map((selling) => ({
            id: selling.id,
            sellingNumber: selling.sellingNumber,
            description: selling.remarks?.trim() || selling.sellingNumber,
            shipmentReference: shipmentReference(shipment),
            status: selling.status,
            updatedAt: selling.updatedAt ?? "",
        }))
    )
    const sellingsTotal = customerSellings.length

    const statusCount = (status: string) => shipments.filter((s) => s.status === status).length
    const ongoing = statusCount("ONGOING")

    const openEditor = () => {
        setTab("details")
        window.setTimeout(
            () => document.getElementById("customer-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }),
            50
        )
    }

    return (
        <DashboardPage atmosphere>
            <ProfileHero
                tone="client"
                backHref="/dashboard/customers"
                backLabel="All customers"
                name={data.customerName}
                code={data.customerCode}
                badges={
                    <>
                        <StatusChip active={Boolean(data.isActive)} />
                        <ShipmentTypeTags types={data.shipmentTypes} />
                    </>
                }
                facts={
                    <>
                        <HeroFact icon={IconMapPin}>{data.address?.trim() || "No address yet"}</HeroFact>
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
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-primary shadow-elev-1 transition-transform hover:-translate-y-0.5"
                        >
                            <IconPencil className="size-3.5" />
                            Edit details
                        </button>
                    </MasterDataWriteGate>
                }
            >
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                    <HeroStat
                        label="Shipments"
                        value={shipments.length}
                        hint={`${ongoing} on the way now`}
                        icon={IconShip}
                        className="col-span-2"
                    >
                        <MixBar
                            parts={[
                                { key: "ONGOING", label: "Ongoing", value: ongoing, className: "bg-[var(--mli-positive)]" },
                                { key: "DRAFT", label: "Draft", value: statusCount("DRAFT"), className: "bg-[var(--mli-on-draft-container)]/45" },
                                { key: "BACKUP", label: "Backup", value: statusCount("BACKUP"), className: "bg-[#e3a13b]" },
                                { key: "FINISHED", label: "Finished", value: statusCount("FINISHED"), className: "bg-primary" },
                            ]}
                        />
                    </HeroStat>
                    <HeroStat label="Shippers" value={customerShippers.length} hint="Who sends the goods" icon={IconRoute} />
                    <HeroStat label="Places" value={totalCustomerLocations} hint="Pickup and drop-off" icon={IconMapPin} />
                    <HeroStat
                        label="Contacts"
                        value={totalCustomerContacts}
                        hint="People to call"
                        icon={IconAddressBook}
                        className="col-span-2 lg:col-span-1"
                    />
                </div>
            </ProfileHero>

            <Tabs value={tab} onValueChange={setTab} className="mt-8 gap-0">
                <div className="overflow-x-auto pb-1">
                    <TabsList className="h-auto min-w-max rounded-full border border-border bg-card p-1">
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
                        {LEGACY_INVOICE_SCREENS_ENABLED ? (
                            <TabsTrigger value="sellings" className={glassTabsTrigger}>
                                Sellings
                                <span className={glassTabCount}>{sellingsTotal}</span>
                            </TabsTrigger>
                        ) : null}
                    </TabsList>
                </div>

                <TabsContent value="details" className="mt-6">
                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                        <DashboardPageCard className="scroll-mt-24">
                            <div id="customer-editor" className="scroll-mt-24" />
                            <MasterDataWriteGate
                                fallback={
                                    <div className="space-y-2">
                                        <h2 className="text-headline-md font-semibold">Customer details</h2>
                                        <p className="text-sm text-muted-foreground">
                                            You can see this customer, but you cannot change it.
                                        </p>
                                    </div>
                                }
                            >
                                <CustomerForm mode="edit" customer={data} />
                            </MasterDataWriteGate>
                        </DashboardPageCard>
                        <aside className="space-y-4 lg:sticky lg:top-24">
                            <RecordFacts
                                title="About this record"
                                rows={[
                                    { icon: IconCalendarPlus, label: "Added on", value: localDate(data.createdAt) },
                                    {
                                        icon: IconClock,
                                        label: "Last change",
                                        value: `${localDate(data.updatedAt)}${updatedBy ? ` by ${updatedBy}` : ""}`,
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
                                    {
                                        icon: IconMapPin,
                                        label: "Address",
                                        value: data.address?.trim() || "Not added yet",
                                    },
                                ]}
                            />
                            <button
                                type="button"
                                onClick={() => setTab("locations-and-contacts")}
                                className="flex w-full cursor-pointer items-center gap-3 rounded-2xl brand-fill p-4 text-left text-primary-foreground transition-transform hover:-translate-y-0.5"
                            >
                                <span className="flex size-10 items-center justify-center rounded-full bg-white/15">
                                    <IconUsersGroup className="size-5" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sm font-semibold">See the network</span>
                                    <span className="block text-xs text-primary-foreground/75">
                                        {customerShippers.length} shippers · {totalCustomerLocations} places ·{" "}
                                        {totalCustomerContacts} contacts
                                    </span>
                                </span>
                            </button>
                        </aside>
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
                    {shipments.length === 0 ? (
                        <EmptyState
                            icon={IconShip}
                            title="No shipments yet"
                            description="Shipments for this customer will show here."
                        />
                    ) : (
                        <ShipmentRouteCards shipments={shipments} />
                    )}
                </TabsContent>

                {LEGACY_INVOICE_SCREENS_ENABLED ? (
                    <TabsContent value="sellings" className="mt-6">
                        <DashboardPageCard>
                            <SectionIntro
                                title="Selling history"
                                description="Charges and invoices for this customer's shipments."
                            />
                            {sellingsTotal === 0 ? (
                                <EmptyState
                                    icon={IconCash}
                                    title="No sellings yet"
                                    description="Sellings from linked shipments will show here."
                                />
                            ) : (
                                <SellingHistoryPage customerSellings={customerSellings} />
                            )}
                        </DashboardPageCard>
                    </TabsContent>
                ) : null}
            </Tabs>
        </DashboardPage>
    )
}

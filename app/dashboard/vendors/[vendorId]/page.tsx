"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useVendorById } from "@/hooks/use-vendors"
import { use, useMemo, useState } from "react"
import { IconArrowLeft, IconBrandWhatsapp, IconFerry } from "@tabler/icons-react"
import CustomerVendorDetailLoading from "@/components/loading/customer-vendor-detail-loading"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { amountCalculation, formatDate, getInitialContactName } from "@/lib/utils"
import { toWhatsAppUrl } from "@/lib/whatsapp"
import { Dot } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import clsx from "clsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import VendorLocationForm from "@/components/forms/vendor-location-form"
import VendorContactForm from "@/components/forms/vendor-contact-form"
import ShipmentHistoryPage from "./(shipments)/shipment-history-page"
import CostingHistoryPage from "./(costings)/costing-history-page"
import { MasterDataWriteGate } from "@/components/write-gates"
import { Costing } from "../../costings/columns"
import { LinkedShipment } from "./(shipments)/shipment-columns"
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
import { StatusChip } from "@/components/ui/status-chip"
import VendorForm from "@/components/forms/vendor-form"
import { VendorMetadataCard } from "@/components/vendor-metadata-card"
import ErrorPage from "@/components/error-page"

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
    updatedAt: string,
    updatedBy?: { name: string }
}

export default function VendorDetailPage({ params }: { params: Promise<{ vendorId: string }> }) {
    const { vendorId } = use(params)
    const { data, isLoading, error } = useVendorById(vendorId)

    const [locationSearch, setLocationSearch] = useState<string>("")

    const filteredVendorLocations = useMemo(() => {
        const locations = data?.vendorLocations ?? []
        const q = locationSearch.trim().toLowerCase()
        if (!q) return locations
        return locations.filter((location: VendorLocation) => {
            const haystack = [
                location.addressLine1,
                location.addressLine2 ?? "",
                location.addressLine3 ?? "",
                location.city,
                location.province,
                location.country,
                location.postalCode ?? "",
            ]
                .join(" ")
                .toLowerCase()
            return haystack.includes(q)
        })
    }, [data?.vendorLocations, locationSearch])

    if (isLoading) return <CustomerVendorDetailLoading />
    if (error) return <ErrorPage title="Vendor not found" message={error.message} />
    if (!data) return <ErrorPage title="Vendor not found" message="Unable to load this vendor." />

    const updatedByName =
        typeof data.updatedBy === "string" ? data.updatedBy : data.updatedBy?.name
    const costings = Array.isArray(data.costings) ? data.costings : []
    const vendorLocations = Array.isArray(data.vendorLocations) ? data.vendorLocations : []

    const vendorCostings = costings.map((costing: Costing) => ({
        id: costing.id,
        invoiceNumber: costing.vendorInvoiceNumber,
        amount: amountCalculation(costing.price, costing.currency, costing.vatPercentage, costing.pph23Percentage),
        shipmentOrderNumber: costing.shipment?.orderNumber ?? "",
        updatedAt: costing.updatedAt ?? "",
    }))

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
            }
        })
        .filter((shipment: LinkedShipment, index: number, self: LinkedShipment[]) =>
            self.findIndex((s: LinkedShipment) => s.id === shipment.id) === index
        )

    /**
     * Function to calculate the total YTD spend for a vendor
     * @returns {number} The total YTD spend
     */
    const calculateYTDSpend = () => {
        let total = 0

        for (const costing of costings) {
            total += amountCalculation(costing.price, costing.currency, costing.vatPercentage, costing.pph23Percentage)
        }

        return total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
    }

    /**
     * Function to calculate the total active shipments for a vendor
     * @returns {number} The total active shipments
     */
    const totalActiveShipments = () => {
        return costings.filter((costing: Costing) => costing.shipment?.isActive).length
    }

    const calculateOutstandingBills = () => {
        let total = 0

        for (const costing of costings) {
            if (costing.status !== "paid") {
                total += amountCalculation(costing.price, costing.currency, costing.vatPercentage, costing.pph23Percentage)
            }
        }

        return total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
    }

    return (
        <DashboardPage>
            {/* Header */}
            <div className="mb-5">
                <Button asChild variant="ghost" className="text-muted-foreground">
                    <Link href={`/dashboard/vendors`}>
                        <IconArrowLeft className="text-2xl"/> Back to vendors
                    </Link>
                </Button>
            </div>

            <Card>
                <CardContent>
                    <div className="flex items-center gap-x-4">
                        <div className="border border-2 rounded-lg p-3">
                            <IconFerry className="text-ring w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-headline-lg">{data.vendorName}</h1>
                            <p className="text-sm text-muted-foreground flex items-center mt-1">Last updated on {formatDate(data.updatedAt)}{updatedByName ? ` by ${updatedByName}` : ""} <Dot /> Registered since {formatDate(data.createdAt)} <Dot /> Vendor Code: {data.vendorCode}</p>
                            <div className="mt-2">
                                <StatusChip active={Boolean(data?.isActive)} />
                            </div>
                        </div>
                    </div>

                    <Separator className="mt-4"/>

                    <div className="grid grid-cols-4 text-center">
                        <div className="w-full border-r">
                            <p className="mt-2 font-bold text-xl">{ totalActiveShipments() }</p>
                            <p className="mb-2 text-sm text-muted-foreground">Active <br /> Shipments</p>
                        </div>

                        <div className="w-full border-r">
                            <p className="mt-2 font-bold text-xl">{ costings.length }</p>
                            <p className="mb-2 text-sm text-muted-foreground">Total <br /> Assignments</p>
                        </div>

                        <div className="w-full border-r">
                            <p className="mt-2 font-bold text-xl">{ calculateYTDSpend() }</p>
                            <p className="mb-2 text-sm text-muted-foreground">YTD <br /> Spend</p>
                        </div>

                        <div className="w-full">
                            <p className="mt-2 font-bold text-xl">{ calculateOutstandingBills() }</p>
                            <p className="mb-2 text-sm text-muted-foreground">Outstanding <br /> Bills</p>
                        </div>

                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="details" className="mt-6">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="offices-and-contacts">Offices & Contacts <span className="bg-blue-100/50 text-ring px-1 rounded-full">{ vendorLocations.length }</span></TabsTrigger>
                    <TabsTrigger value="shipment-history">Shipment History <span className="bg-blue-100/50 text-ring px-1 rounded-full">{ vendorShipments.length }</span></TabsTrigger>
                    <TabsTrigger value="costings">Costings <span className="bg-blue-100/50 text-ring px-1 rounded-full">{ costings.length }</span></TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-6">
                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
                        <aside className="lg:sticky lg:top-6">
                            <VendorMetadataCard vendor={data} />
                        </aside>
                        <DashboardPageCard>
                            <MasterDataWriteGate
                                fallback={
                                    <div className="space-y-2">
                                        <h2 className="text-headline-md font-semibold">Vendor details</h2>
                                        <p className="text-sm text-muted-foreground">
                                            You can view this vendor profile, but you do not have permission to edit it.
                                        </p>
                                    </div>
                                }
                            >
                                <VendorForm mode="edit" vendor={data} />
                            </MasterDataWriteGate>
                        </DashboardPageCard>
                    </div>
                </TabsContent>
                <TabsContent value="offices-and-contacts">
                    <div className="flex flex-row items-center justify-between mb-4">
                        <p className="text-sm text-muted-foreground my-2 flex flex-row">{ vendorLocations.length } offices <Dot /> { vendorLocations.reduce((total, location) => total + (Array.isArray(location.vendorContacts) ? location.vendorContacts.length : 0), 0) } contacts</p>
                        <MasterDataWriteGate>
                            <VendorLocationForm mode="create" id={undefined} addressLine1={undefined} addressLine2={undefined} addressLine3={undefined} city={undefined} province={undefined} country={undefined} postalCode={undefined} vendorId={vendorId} />
                        </MasterDataWriteGate>
                    </div>

                    <Input
                        placeholder="Search locations by address, city, province, or country"
                        className="mb-4 w-full max-w-md"
                        value={locationSearch ?? ""}
                        onChange={(e) => setLocationSearch(e.target.value)}
                    />

                    {
                        vendorLocations.length === 0 ? <p>No locations found for this vendor ...</p> :
                        filteredVendorLocations.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No locations match &quot;{locationSearch.trim()}&quot;.</p>
                        ) :
                        filteredVendorLocations.map((location: VendorLocation) => {
                            const locationContacts = Array.isArray(location.vendorContacts) ? location.vendorContacts : []

                            return (
                            <Card key={location.id} className="mb-4">
                                <CardContent>
                                    <div className="flex flex-row items-start justify-between">
                                        <div>
                                            <div className="flex flex-row items-start gap-x-2">
                                                <h2 className="text-lg font-bold">{ location.addressLine1 }</h2>
                                                <div className="mt-2">
                                                    <StatusChip active />
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                <p>{`${ location.addressLine2 === "" ? "" : location.addressLine2 + ", " } ${ location.addressLine3 === "" ? "" : location.addressLine3 + ", "} ${ location.city }, ${ location.province }, ${ location.country } ${ location.postalCode === "" ? "" : location.postalCode }`}</p>
                                                <p>Last updated on { formatDate(location.updatedAt) } by { location.updatedBy?.name ?? "Unknown" }</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-row items-start gap-x-2">
                                            <MasterDataWriteGate>
                                                <VendorLocationForm mode="edit" id={location.id} addressLine1={location.addressLine1} addressLine2={location.addressLine2} addressLine3={location.addressLine3} city={location.city} province={location.province} country={location.country} postalCode={location.postalCode} vendorId={vendorId} />
                                                <VendorContactForm mode="create" contactName={undefined} phoneNumber={undefined} email={undefined} isActive={undefined} vendorId={vendorId} locationId={location.id} />
                                            </MasterDataWriteGate>
                                        </div>
                                    </div>

                                    <Separator className="mt-4"/>

                                    {
                                        locationContacts.length === 0 ? <p className="mt-4">No contacts found for this location ...</p> :
                                        locationContacts.map((contact: VendorContact) => (        
                                            <div key={contact.id}>
                                                <div className="flex flex-row items-center justify-between my-2">
                                                    <div className="flex flex-row items-center gap-x-2">
                                                        <Avatar>
                                                            <AvatarFallback>{ getInitialContactName(contact.contactName) }</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h2 className="font-semibold text-sm">{ contact.contactName }</h2>
                                                            <p className="text-xs text-muted-foreground">{ contact.email === "" ? "No email provided" : contact.email }</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-row items-center gap-x-2">
                                                        <p className="text-sm text-muted-foreground">{ contact.phoneNumber === "" ? "No phone number provided" : contact.phoneNumber }</p>
                                                        {toWhatsAppUrl(contact.phoneNumber) ? (
                                                        <Button variant="outline" size="icon" asChild><Link href={toWhatsAppUrl(contact.phoneNumber)!} target="_blank" rel="noopener noreferrer"><IconBrandWhatsapp className="text-[#25D366] hover:text-[#25D366]" /></Link></Button>
                                                        ) : null}
                                                        <MasterDataWriteGate>
                                                            <VendorContactForm mode="edit" id={contact.id} contactName={contact.contactName} phoneNumber={contact.phoneNumber} email={contact.email} isActive={contact.isActive} vendorId={vendorId} locationId={location.id} />
                                                        </MasterDataWriteGate>
                                                    </div>
                                                </div>

                                                <Separator className="my-3" />
                                            </div>
                                        ))
                                    }
                                </CardContent>
                            </Card>
                            )
                        })
                    }
                </TabsContent>
                <TabsContent value="shipment-history">
                    <ShipmentHistoryPage vendorShipments={vendorShipments} />
                </TabsContent>
                <TabsContent value="costings">
                    <CostingHistoryPage vendorName={data.vendorName} vendorCostings={vendorCostings} />
                </TabsContent>
            </Tabs>
        </DashboardPage>
    )
}
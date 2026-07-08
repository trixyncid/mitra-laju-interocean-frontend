"use client"

import { Card, CardContent } from "@/components/ui/card"
import { use, useMemo, useState } from "react"
import { IconArrowLeft, IconBrandWhatsapp, IconBuildingFactory2 } from "@tabler/icons-react"
import { useCustomerById } from "@/hooks/use-customers"
import ErrorPage from "@/components/error-page"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Dot } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import clsx from "clsx"
import { amountCalculation, formatDate, getInitialContactName } from "@/lib/utils"
import { toWhatsAppUrl } from "@/lib/whatsapp"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CustomerLocationForm from "@/components/forms/customer-location-form"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import CustomerShipperForm from "@/components/forms/customer-shipper-form"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import CustomerContactForm from "@/components/forms/customer-contact-form"
import ShipmentHistoryPage from "./(shipments)/shipment-history-page"
import type { LinkedShipment } from "./(shipments)/shipment-columns"
import CostingHistoryPage from "./(costings)/costing-history-page"
import { Costing as CustomerCosting } from "./(costings)/costing-column"
import { Costing } from "@/app/dashboard/costings/columns"
import CustomerVendorDetailLoading from "@/components/loading/customer-vendor-detail-loading"
import { MasterDataWriteGate } from "@/components/write-gates"
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
import { StatusChip } from "@/components/ui/status-chip"
import { CustomerMetadataCard } from "@/components/customer-metadata-card"
import CustomerForm from "@/components/forms/customer-form"
import type { CustomerShipment } from "@/lib/types/entity-details"

type CustomerContact = {
    id: string
    contactName: string
    phoneNumber: string
    email: string
    isActive: boolean
}

type CustomerLocation = {
    id: string
    addressLine1: string
    addressLine2: string
    addressLine3: string
    city: string
    province: string
    country: string
    postalCode: string
    customerContacts: CustomerContact[]
    updatedAt: string,
    updatedBy: { name: string }
}

type CustomerShipper = {
    id: string,
    name: string,
    phoneNumber: string,
    country: string,
    isActive: boolean,
    customerLocations: CustomerLocation[],
    updatedAt: string,
    updatedBy: string
}


export default function CustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) {
    const { customerId } = use(params)
    const { data, isLoading, error } = useCustomerById(customerId)

    const [shipperSearch, setShipperSearch] = useState<string>("")

    const filteredShippers = useMemo(() => {
        const shippers = data?.customerShippers ?? []
        const q = shipperSearch.trim().toLowerCase()
        if (!q) return shippers
        return shippers.filter((shipper: CustomerShipper) => {
            const haystack = [shipper.name, shipper.phoneNumber ?? "", shipper.country ?? ""]
                .join(" ")
                .toLowerCase()
            return haystack.includes(q)
        })
    }, [data?.customerShippers, shipperSearch])

    if (error) return <ErrorPage title="Customer Detail Not Found" message="Customer detail not found. Please check the customer ID and try again." />
    if (isLoading) return <CustomerVendorDetailLoading />
    if (!data) return <ErrorPage title="Customer not found" message="Unable to load this customer." />
    /**
     * Function to count the total number of customer locations for a customer
     * @returns {number} The total number of customer locations
     */
    const totalCustomerLocations = data.customerShippers?.map((shipper: CustomerShipper) => shipper.customerLocations.length).reduce((a: number, b: number) => a + b, 0) ?? 0

    /**
     * Function to count the total number of customer contacts for a customer
     * @returns {number} The total number of customer contacts
     */
    const totalCustomerContacts = data.customerShippers?.map((shipper: CustomerShipper) => shipper.customerLocations.map((location: CustomerLocation) => location.customerContacts.length).reduce((a: number, b: number) => a + b, 0)).reduce((a: number, b: number) => a + b, 0) ?? 0
    
    /**
     * Function to map the customer shipments to a new object
     * @returns {Shipment[]} The mapped customer shipments
     */
    const customerShipments: LinkedShipment[] = (data.shipments ?? []).map((shipment: CustomerShipment) => ({
        id: shipment.id,
        orderNumber: shipment.orderNumber,
        customerCode: shipment.customerCode.customerName + " (" + shipment.customerCode.customerCode + ")",
        customerShipper: shipment.customerShipper.name,
        departureCountry: shipment.shipmentOperational?.portDeparture?.portCountry ?? "",
        arrivalCountry: shipment.shipmentOperational?.portDestination?.portCountry ?? "",
        eta: shipment.shipmentOperational?.eta?.split('T')[0] ?? "",
    }))

    /**
     * Function to map the customer costings to a new object
     * @returns {CustomerCosting[]} The mapped customer costings
     */
    const customerCostings = () => {
        const costings: CustomerCosting[] = []

        for (const shipment of data.shipments ?? []) {
            costings.push(...shipment.costings.map((costing: Costing) => ({
                id: costing.id,
                invoiceNumber: costing.vendorInvoiceNumber,
                amount: amountCalculation(costing.price, costing.currency, costing.vatPercentage, costing.pph23Percentage),
                shipmentOrderNumber: costing.shipment?.orderNumber ?? "",
                updatedAt: costing.updatedAt ?? "",
            } as CustomerCosting)))
        }

        return costings
    }
    
    /**
     * Function to count the total number of costings for a customer
     * @returns {number} The total number of costings
     */
    const costingsCount = () => {
        let count = 0

        for (const shipment of data.shipments ?? []) {
            count += shipment.costings.length
        }

        return count
    }

    /**
     * Function to calculate the total YTD spend for a customer
     * @returns {number} The total YTD spend
     */
    const calculateYTDSpend = () => {
        let total = 0

        for (const shipment of data.shipments ?? []) {
            total += shipment.costings.reduce((acc: number, costing: Costing) => acc + amountCalculation(costing.price, costing.currency, costing.vatPercentage, costing.pph23Percentage), 0)
        }

        return total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
    }

    const calculateOutstandingBills = () => {
        let total = 0

        for (const shipment of data.shipments ?? []) {
            if (shipment.shipmentOperational?.status !== "paid" && shipment.shipmentOperational?.customerChargeAmount) {
                total += shipment.shipmentOperational.customerChargeAmount
            }
        }

        return total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
    }

    return (  
        <DashboardPage>
            <div className="mb-5">
                <Button asChild variant="ghost" className="text-muted-foreground">
                    <Link href={`/dashboard/customers`}>
                        <IconArrowLeft className="text-2xl"/> Back to customers
                    </Link>
                </Button>
            </div>
            <Card>
                <CardContent>
                <div className="flex items-center gap-x-4">
                        <div className="border border-2 rounded-lg p-3">
                            <IconBuildingFactory2 className="text-ring w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-headline-lg">{ data.customerName}</h1>
                            <p className="text-sm text-muted-foreground flex items-center mt-1">Last updated on {formatDate(data.updatedAt)} by {data.updatedBy.name} <Dot /> Registered since {formatDate(data.createdAt)} <Dot /> Vendor Code: { data.customerCode }</p>
                            <div className="mt-2">
                                <StatusChip active={Boolean(data?.isActive)} />
                            </div>
                        </div>
                    </div>

                    <Separator className="mt-4"/>

                    <div className="grid grid-cols-4 text-center">
                        <div className="w-full border-r">
                            <p className="mt-2 font-bold text-xl">{ data.shipments.filter((shipment: CustomerShipment) => shipment.isActive).length }</p>
                            <p className="mb-2 text-sm text-muted-foreground">Active <br /> Shipments</p>
                        </div>

                        <div className="w-full border-r">
                            <p className="mt-2 font-bold text-xl">{ data.shipments.length }</p>
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
                    <TabsTrigger value="locations-and-contacts">Locations & Contacts <span className="bg-blue-100/50 text-ring px-1 rounded-full">{ data.customerShippers.length }</span></TabsTrigger>
                    <TabsTrigger value="shipment-history">Shipment History <span className="bg-blue-100/50 text-ring px-1 rounded-full">{ data.shipments.length }</span></TabsTrigger>
                    <TabsTrigger value="costings">Costings <span className="bg-blue-100/50 text-ring px-1 rounded-full">{ costingsCount() }</span></TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-6">
                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
                        <aside className="lg:sticky lg:top-6">
                            <CustomerMetadataCard customer={data} />
                        </aside>
                        <DashboardPageCard>
                            <MasterDataWriteGate
                                fallback={
                                    <div className="space-y-2">
                                        <h2 className="text-headline-md font-semibold">Customer details</h2>
                                        <p className="text-sm text-muted-foreground">
                                            You can view this customer profile, but you do not have permission to edit it.
                                        </p>
                                    </div>
                                }
                            >
                                <CustomerForm mode="edit" customer={data} />
                            </MasterDataWriteGate>
                        </DashboardPageCard>
                    </div>
                </TabsContent>
                <TabsContent value="locations-and-contacts">
                    <div className="flex flex-row items-center justify-between mb-4">
                        <p className="text-sm text-muted-foreground my-2 flex flex-row">{ data.customerShippers.length } shippers <Dot /> { totalCustomerLocations } locations <Dot /> { totalCustomerContacts } contacts</p>
                        <MasterDataWriteGate>
                            <CustomerShipperForm mode="create" id={undefined} name={undefined} phoneNumber={undefined} country={undefined} isActive={undefined} customerId={data.id} />
                        </MasterDataWriteGate>
                    </div>

                    <Input
                        placeholder="Search shippers by name, phone, or country"
                        className="mb-4 w-full max-w-md"
                        value={shipperSearch ?? ""}
                        onChange={(e) => setShipperSearch(e.target.value)}
                    />

                    <Accordion type="multiple">
                        {
                            data.customerShippers.length === 0 ? <p>No shippers found for this customer ...</p>
                            :
                            filteredShippers.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No shippers match &quot;{shipperSearch.trim()}&quot;.</p>
                            ) :
                            filteredShippers.map((shipper: CustomerShipper) => (
                                <AccordionItem value={shipper.id} key={shipper.id}>
                                    <AccordionTrigger className="flex flex-row items-center">
                                        <div>
                                            <h1 className="text-xl font-semibold">{shipper.name}</h1>
                                            <div className="flex flex-row items-center">
                                                { shipper.country }
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-sm text-muted-foreground flex flex-row">{ shipper.customerLocations.length } locations <Dot /> { shipper.customerLocations.map((location: CustomerLocation) => location.customerContacts.length).reduce((a: number, b: number) => a + b, 0) } contacts</p>
                                            
                                            <div className="flex items-center gap-x-2">
                                                <MasterDataWriteGate>
                                                    <CustomerShipperForm mode="edit" id={shipper.id} name={shipper.name} phoneNumber={shipper.phoneNumber} country={shipper.country} isActive={shipper.isActive} customerId={data.id} />
                                                    <CustomerLocationForm mode="create" id={undefined} customerId={data.id} shipperId={shipper.id} addressLine1={undefined} addressLine2={undefined} addressLine3={undefined} city={undefined} province={undefined} country={undefined} postalCode={undefined} />
                                                </MasterDataWriteGate>
                                            </div>
                                        </div>
                                        {
                                            shipper.customerLocations.length === 0 ? <p>No locations found for this shipper ...</p>
                                            :
                                            shipper.customerLocations.map((location: CustomerLocation) => (
                                                <Card key={location.id} className="my-4">
                                                    <CardContent>
                                                        <div className="flex flex-row items-start justify-between">
                                                            <div>
                                                                <div className="flex flex-row items-start gap-x-2">
                                                                    <h2 className="text-lg font-bold">{location.addressLine1}</h2>
                                                                    <div className="mt-2">
                                                                        <StatusChip active />
                                                                    </div>
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    <p>{`${ location.addressLine2 === "" ? "" : location.addressLine2 + ", " } ${ location.addressLine3 === "" ? "" : location.addressLine3 + ", "} ${ location.city }, ${ location.province }, ${ location.country } ${ location.postalCode === "" ? "" : location.postalCode }`}</p>
                                                                    <p>Last updated on { formatDate(location.updatedAt) } by { location.updatedBy.name }</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-row items-center gap-x-2">
                                                                <MasterDataWriteGate>
                                                                    <CustomerLocationForm mode="edit" id={location.id} customerId={data.id} shipperId={shipper.id} addressLine1={location.addressLine1} addressLine2={location.addressLine2} addressLine3={location.addressLine3} city={location.city} province={location.province} country={location.country} postalCode={location.postalCode} />
                                                                    <CustomerContactForm mode="create" contactName={undefined} customerId={data.id} shipperId={shipper.id} phoneNumber={undefined} email={undefined} isActive={undefined} locationId={location.id} />
                                                                </MasterDataWriteGate>
                                                            </div>
                                                        </div>

                                                        <Separator className="mt-4"/>

                                                        <div>
                                                            {
                                                                location.customerContacts.length === 0 ? <p className="mt-4">No contacts found for this location ...</p>
                                                                :
                                                                location.customerContacts.map((contact: CustomerContact) => (    
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
                                                                                    <CustomerContactForm mode="edit" id={contact.id} contactName={contact.contactName} customerId={data.id} shipperId={shipper.id} phoneNumber={contact.phoneNumber} email={contact.email} isActive={contact.isActive} locationId={location.id} />
                                                                                </MasterDataWriteGate>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <Separator className="my-3" />
                                                                    </div>    
                                                                ))
                                                            }
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        }
                                    </AccordionContent>
                                </AccordionItem>
                            ))
                        }
                    </Accordion>
                </TabsContent>
                <TabsContent value="shipment-history">
                    <ShipmentHistoryPage customerShipments={customerShipments} />
                </TabsContent>
                <TabsContent value="costings">
                    <CostingHistoryPage customerName={data.customerName ?? ""} customerCostings={customerCostings()} />
                </TabsContent>
            </Tabs>
        </DashboardPage>
    )
}
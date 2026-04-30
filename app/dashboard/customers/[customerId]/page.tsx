"use client"

import { Card, CardContent } from "@/components/ui/card"
import { use } from "react"
import { IconArrowLeft, IconBrandWhatsapp, IconBuildingFactory2 } from "@tabler/icons-react"
import { useCustomerById } from "@/hooks/use-customers"
import ErrorPage from "@/components/error-page"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Dot } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import clsx from "clsx"
import { amountCalculation, formatDate, getInitialContactName } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CustomerLocationForm from "@/components/forms/customer-location-form"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import CustomerShipperForm from "@/components/forms/customer-shipper-form"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import CustomerContactForm from "@/components/forms/customer-contact-form"
import ShipmentHistoryPage from "./(shipments)/shipment-history-page"
import CostingHistoryPage from "./(costings)/costing-history-page"
import { Costing as CustomerCosting } from "./(costings)/costing-column"
import { Costing } from "@/app/dashboard/costings/columns"
import CustomerVendorDetailLoading from "@/components/loading/customer-vendor-detail-loading"

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

type Shipment = {
    id: string,
    orderNumber: string,
    customerCode: { customerName: string, customerCode: string },
    customerShipper: { name: string },
    shipmentOperational: { portDeparture: { portCountry: string }, portDestination: { portCountry: string }, eta: string },
    costings: Costing[],
    isActive: boolean,
}

export default function CustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) {
    const { customerId } = use(params)
    const { data, isLoading, error } = useCustomerById(customerId)

    console.log('data', data)
    /**
     * Function to count the total number of customer locations for a customer
     * @returns {number} The total number of customer locations
     */
    const totalCustomerLocations = data?.customerShippers.map((shipper: CustomerShipper) => shipper.customerLocations.length).reduce((a: number, b: number) => a + b, 0)

    /**
     * Function to count the total number of customer contacts for a customer
     * @returns {number} The total number of customer contacts
     */
    const totalCustomerContacts = data?.customerShippers.map((shipper: CustomerShipper) => shipper.customerLocations.map((location: CustomerLocation) => location.customerContacts.length).reduce((a: number, b: number) => a + b, 0)).reduce((a: number, b: number) => a + b, 0)
    
    /**
     * Function to map the customer shipments to a new object
     * @returns {Shipment[]} The mapped customer shipments
     */
    const customerShipments = data?.shipments.map((shipment: Shipment) => ({
        id: shipment.id,
        orderNumber: shipment?.orderNumber,
        customerCode: shipment.customerCode.customerName + " (" + shipment.customerCode.customerCode + ")",
        customerShipper: shipment.customerShipper.name,
        departureCountry: shipment.shipmentOperational?.portDeparture?.portCountry,
        arrivalCountry: shipment.shipmentOperational?.portDestination?.portCountry,
        eta: shipment.shipmentOperational?.eta?.split('T')[0] ?? "",
    }))

    /**
     * Function to map the customer costings to a new object
     * @returns {CustomerCosting[]} The mapped customer costings
     */
    const customerCostings = () => {
        const costings: CustomerCosting[] = []

        for (const shipment of data?.shipments) {
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

        for (const shipment of data?.shipments) {
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

        for (const shipment of data?.shipments) {
            total += shipment.costings.reduce((acc: number, costing: Costing) => acc + amountCalculation(costing.price, costing.currency, costing.vatPercentage, costing.pph23Percentage), 0)
        }

        return total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
    }

    const calculateOutstandingBills = () => {
        let total = 0

        for (const shipment of data?.shipments) {
            if (shipment.shipmentOperational?.status !== "paid" && shipment.shipmentOperational?.customerChargeAmount) {
                total += shipment.shipmentOperational.customerChargeAmount
            }
        }

        return total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
    }

    if (error) return <ErrorPage title="Customer Detail Not Found" message="Customer detail not found. Please check the customer ID and try again." />

    if (isLoading) return <CustomerVendorDetailLoading />

    return (  
        <div className="px-4 lg:px-6">
            <div className="mb-5">
                <Button asChild variant="ghost" className="text-slate-500">
                    <Link href={`/dashboard/customers`}>
                        <IconArrowLeft className="text-2xl"/> Back to customers
                    </Link>
                </Button>
            </div>
            <Card>
                <CardContent>
                <div className="flex items-center gap-x-4">
                        <div className="border border-2 rounded-lg p-3">
                            <IconBuildingFactory2 className="text-blue-500 w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">{ data.customerName}</h1>
                            <p className="text-sm text-slate-500 flex items-center mt-1">Last updated on {formatDate(data.updatedAt)} by {data.updatedBy.name} <Dot /> Registered since {formatDate(data.createdAt)} <Dot /> Vendor Code: { data.customerCode }</p>
                            <p className={clsx("text-xs font-medium rounded-full pl-1 pr-3 flex items-center w-fit mt-2", data?.isActive ? "text-green-500 bg-green-100/50" : "bg-red-100/50 text-red-500")}><Dot className="animate-pulse"/> {data?.isActive ? "Active" : "Inactive"}</p>
                        </div>
                    </div>

                    <Separator className="mt-4"/>

                    <div className="grid grid-cols-4 text-center">
                        <div className="w-full border-r">
                            <p className="mt-2 font-bold text-xl">{ data.shipments.filter((shipment: Shipment) => shipment.isActive).length }</p>
                            <p className="mb-2 text-sm text-slate-500">Active <br /> Shipments</p>
                        </div>

                        <div className="w-full border-r">
                            <p className="mt-2 font-bold text-xl">{ data.shipments.length }</p>
                            <p className="mb-2 text-sm text-slate-500">Total <br /> Assignments</p>
                        </div>

                        <div className="w-full border-r">
                            <p className="mt-2 font-bold text-xl">{ calculateYTDSpend() }</p>
                            <p className="mb-2 text-sm text-slate-500">YTD <br /> Spend</p>
                        </div>

                        <div className="w-full">
                            <p className="mt-2 font-bold text-xl">{ calculateOutstandingBills() }</p>
                            <p className="mb-2 text-sm text-slate-500">Outstanding <br /> Bills</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="locations-and-contacts" className="mt-6">
                <TabsList>
                    <TabsTrigger value="locations-and-contacts">Locations & Contacts <span className="bg-blue-100/50 text-blue-500 px-1 rounded-full">{ data.customerShippers.length }</span></TabsTrigger>
                    <TabsTrigger value="shipment-history">Shipment History <span className="bg-blue-100/50 text-blue-500 px-1 rounded-full">{ data.shipments.length }</span></TabsTrigger>
                    <TabsTrigger value="costings">Costings <span className="bg-blue-100/50 text-blue-500 px-1 rounded-full">{ costingsCount() }</span></TabsTrigger>
                </TabsList>
                <TabsContent value="locations-and-contacts">
                    <div className="flex flex-row items-center justify-between mb-4">
                        <p className="text-sm text-slate-500 my-2 flex flex-row">{ data.customerShippers.length } shippers <Dot /> { totalCustomerLocations } locations <Dot /> { totalCustomerContacts } contacts</p>
                        <CustomerShipperForm mode="create" id={undefined} name={undefined} phoneNumber={undefined} country={undefined} isActive={undefined} customerId={data.id} />
                    </div>
                    <Accordion type="multiple">
                        {
                            data.customerShippers.length === 0 ? <p>No shippers found for this customer ...</p>
                            :
                            data.customerShippers.map((shipper: CustomerShipper) => (
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
                                            <p className="text-sm text-slate-500 flex flex-row">{ shipper.customerLocations.length } locations <Dot /> { shipper.customerLocations.map((location: CustomerLocation) => location.customerContacts.length).reduce((a: number, b: number) => a + b, 0) } contacts</p>
                                            
                                            <div className="flex items-center gap-x-2">
                                                <CustomerShipperForm mode="edit" id={shipper.id} name={shipper.name} phoneNumber={shipper.phoneNumber} country={shipper.country} isActive={shipper.isActive} customerId={data.id} />
                                                <CustomerLocationForm mode="create" id={undefined} customerId={data.id} shipperId={shipper.id} addressLine1={undefined} addressLine2={undefined} addressLine3={undefined} city={undefined} province={undefined} country={undefined} postalCode={undefined} />
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
                                                                    <p className={clsx("text-xs font-medium rounded-full pl-1 pr-3 flex items-center w-fit mt-2", true ? "text-green-500 bg-green-100/50" : "bg-red-100/50 text-red-500")}><Dot className="animate-pulse"/> {true ? "Active" : "Inactive"}</p>
                                                                </div>
                                                                <div className="text-xs text-slate-500">
                                                                    <p>{`${ location.addressLine2 === "" ? "" : location.addressLine2 + ", " } ${ location.addressLine3 === "" ? "" : location.addressLine3 + ", "} ${ location.city }, ${ location.province }, ${ location.country } ${ location.postalCode === "" ? "" : location.postalCode }`}</p>
                                                                    <p>Last updated on { formatDate(location.updatedAt) } by { location.updatedBy.name }</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-row items-center gap-x-2">
                                                                <CustomerLocationForm mode="edit" id={location.id} customerId={data.id} shipperId={shipper.id} addressLine1={location.addressLine1} addressLine2={location.addressLine2} addressLine3={location.addressLine3} city={location.city} province={location.province} country={location.country} postalCode={location.postalCode} />
                                                                <CustomerContactForm mode="create" contactName={undefined} customerId={data.id} shipperId={shipper.id} phoneNumber={undefined} email={undefined} isActive={undefined} locationId={location.id} />
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
                                                                                    <p className="text-xs text-slate-500">{ contact.email === "" ? "No email provided" : contact.email }</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex flex-row items-center gap-x-2">
                                                                                <p className="text-sm text-slate-500">{ contact.phoneNumber === "" ? "No phone number provided" : contact.phoneNumber }</p>
                                                                                <Button variant="outline" size="icon" asChild><Link href={`https://wa.me/62${contact.phoneNumber.slice(1)}`} target="_blank"><IconBrandWhatsapp className="text-[#25D366] hover:text-[#25D366]" /></Link></Button>
                                                                                <CustomerContactForm mode="edit" id={contact.id} contactName={contact.contactName} customerId={data.id} shipperId={shipper.id} phoneNumber={contact.phoneNumber} email={contact.email} isActive={contact.isActive} locationId={location.id} />
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
        </div>
    )
}
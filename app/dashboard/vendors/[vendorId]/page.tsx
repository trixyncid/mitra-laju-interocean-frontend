"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useVendorById } from "@/hooks/use-vendors"
import { use } from "react"
import { IconArrowLeft, IconBrandWhatsapp, IconFerry } from "@tabler/icons-react"
import CustomerVendorDetailLoading from "@/components/loading/customer-vendor-detail-loading"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { amountCalculation, formatDate, getInitialContactName } from "@/lib/utils"
import { Dot } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import clsx from "clsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import VendorLocationForm from "@/components/forms/vendor-location-form"
import VendorContactForm from "@/components/forms/vendor-contact-form"
import ShipmentHistoryPage from "./(shipments)/shipment-history-page"
import CostingHistoryPage from "./(costings)/costing-history-page"
import { Costing } from "../../costings/columns"
import { LinkedShipment } from "./(shipments)/shipment-columns"

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
    updatedBy: { name: string }
}

export default function CustomerDetailPage({ params }: { params: Promise<{ vendorId: string }> }) {
    const { vendorId } = use(params)
    const { data, isLoading, error } = useVendorById(vendorId)

    console.log(data)

    if (isLoading) return <CustomerVendorDetailLoading />

    if (error) return <div>Error: {error.message}</div>

    const vendorCostings = data.costings.map((costing: Costing) => ({
        id: costing.id,
        invoiceNumber: costing.vendorInvoiceNumber,
        amount: amountCalculation(costing.price, costing.currency, costing.vatPercentage, costing.pph23Percentage),
        shipmentOrderNumber: costing.shipment?.orderNumber ?? "",
        updatedAt: costing.updatedAt ?? "",
    }))

    const vendorShipments: LinkedShipment[] = data.costings.map((costing: Costing) => ({
        id: costing.shipment?.id ?? "",
        eta: costing.shipment?.shipmentOperational?.eta ?? "",
        orderNumber: costing.shipment?.orderNumber ?? "",
        customerCode: costing.shipment?.customerCode?.customerCode ?? "",
        customerShipper: costing.shipment?.customerShipper?.name ?? "",
        departureCountry: costing.shipment?.shipmentOperational?.portDeparture?.portCountry ?? "",
        arrivalCountry: costing.shipment?.shipmentOperational?.portDestination?.portCountry ?? "",
    }))

    /**
     * Function to calculate the total YTD spend for a vendor
     * @returns {number} The total YTD spend
     */
    const calculateYTDSpend = () => {
        let total = 0

        for (const costing of data.costings) {
            total += amountCalculation(costing.price, costing.currency, costing.vatPercentage, costing.pph23Percentage)
        }

        return total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
    }

    /**
     * Function to calculate the total active shipments for a vendor
     * @returns {number} The total active shipments
     */
    const totalActiveShipments = () => {
        return data.costings.filter((costing: Costing) => costing.shipment?.isActive).length
    }

    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="mb-5">
                <Button asChild variant="ghost" className="text-slate-500">
                    <Link href={`/dashboard/vendors`}>
                        <IconArrowLeft className="text-2xl"/> Back to vendors
                    </Link>
                </Button>
            </div>

            <Card>
                <CardContent>
                    <div className="flex items-center gap-x-4">
                        <div className="border border-2 rounded-lg p-3">
                            <IconFerry className="text-blue-500 w-10 h-10" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">{data.vendorName}</h1>
                            <p className="text-sm text-slate-500 flex items-center mt-1">Last updated on {formatDate(data.updatedAt)} by {data.updatedBy.name} <Dot /> Registered since {formatDate(data.createdAt)} <Dot /> Vendor Code: {data.vendorCode}</p>
                            <p className={clsx("text-xs font-medium rounded-full pl-1 pr-3 flex items-center w-fit mt-2", data?.isActive ? "text-green-500 bg-green-100/50" : "bg-red-100/50 text-red-500")}><Dot className="animate-pulse"/> {data?.isActive ? "Active" : "Inactive"}</p>
                        </div>
                    </div>

                    <Separator className="mt-4"/>

                    <div className="grid grid-cols-4 text-center">
                        <div className="w-full border-r">
                            <p className="mt-2 font-bold text-xl">{ totalActiveShipments() }</p>
                            <p className="mb-2 text-sm text-slate-500">Active <br /> Shipments</p>
                        </div>

                        <div className="w-full border-r">
                            <p className="mt-2 font-bold text-xl">{ data.costings.length }</p>
                            <p className="mb-2 text-sm text-slate-500">Total <br /> Assignments</p>
                        </div>

                        <div className="w-full border-r">
                            <p className="mt-2 font-bold text-xl">{ calculateYTDSpend() }</p>
                            <p className="mb-2 text-sm text-slate-500">YTD <br /> Spend</p>
                        </div>

                        <div className="w-full">
                            <p className="mt-2 font-bold text-xl">Rp. 1,000,000</p>
                            <p className="mb-2 text-sm text-slate-500">Outstanding <br /> Bills</p>
                        </div>

                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="offices-and-contacts" className="mt-6">
                <TabsList>
                    <TabsTrigger value="offices-and-contacts">Offices & Contacts <span className="bg-blue-100/50 text-blue-500 px-1 rounded-full">{ data.vendorLocations.length }</span></TabsTrigger>
                    <TabsTrigger value="shipment-history">Shipment History <span className="bg-blue-100/50 text-blue-500 px-1 rounded-full">{ data.costings.length }</span></TabsTrigger>
                    <TabsTrigger value="costings">Costings <span className="bg-blue-100/50 text-blue-500 px-1 rounded-full">{ data.costings.length }</span></TabsTrigger>
                </TabsList>
                <TabsContent value="offices-and-contacts">
                    <div className="flex flex-row items-center justify-between mb-4">
                        <p className="text-sm text-slate-500 my-2 flex flex-row">{ data.vendorLocations.length } offices <Dot /> { data.vendorLocations.map((loc: VendorLocation) => loc.vendorContacts.length).reduce((a: number, b: number) => a + b, 0) } contacts</p>
                        <VendorLocationForm mode="create" id={undefined} addressLine1={undefined} addressLine2={undefined} addressLine3={undefined} city={undefined} province={undefined} country={undefined} postalCode={undefined} vendorId={vendorId} />
                    </div>

                    {
                        data.vendorLocations.length === 0 ? <p>No locations found for this vendor ...</p> :
                        data.vendorLocations.map((location: VendorLocation) => (
                            <Card key={location.id}>
                                <CardContent>
                                    <div className="flex flex-row items-start justify-between">
                                        <div>
                                            <div className="flex flex-row items-start gap-x-2">
                                                <h2 className="text-lg font-bold">{ location.addressLine1 }</h2>
                                                <p className={clsx("text-xs font-medium rounded-full pl-1 pr-3 flex items-center w-fit mt-2", true ? "text-green-500 bg-green-100/50" : "bg-red-100/50 text-red-500")}><Dot className="animate-pulse"/> {true ? "Active" : "Inactive"}</p>
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                <p>{`${ location.addressLine2 === "" ? "" : location.addressLine2 + ", " } ${ location.addressLine3 === "" ? "" : location.addressLine3 + ", "} ${ location.city }, ${ location.province }, ${ location.country } ${ location.postalCode === "" ? "" : location.postalCode }`}</p>
                                                <p>Last updated on { formatDate(location.updatedAt) } by { location.updatedBy?.name ?? "Unknown" }</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-row items-start gap-x-2">
                                            <VendorLocationForm mode="edit" id={location.id} addressLine1={location.addressLine1} addressLine2={location.addressLine2} addressLine3={location.addressLine3} city={location.city} province={location.province} country={location.country} postalCode={location.postalCode} vendorId={vendorId} />
                                            <VendorContactForm mode="create" contactName={undefined} phoneNumber={undefined} email={undefined} isActive={undefined} vendorId={vendorId} locationId={location.id} />
                                        </div>
                                    </div>

                                    <Separator className="mt-4"/>

                                    {
                                        location.vendorContacts.length === 0 ? <p className="mt-4">No contacts found for this location ...</p> :
                                        location.vendorContacts.map((contact: VendorContact) => (        
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
                                                        <VendorContactForm mode="edit" id={contact.id} contactName={contact.contactName} phoneNumber={contact.phoneNumber} email={contact.email} isActive={contact.isActive} vendorId={vendorId} locationId={location.id} />
                                                    </div>
                                                </div>

                                                <Separator className="my-3" />
                                            </div>
                                        ))
                                    }
                                </CardContent>
                            </Card>
                        ))
                    }
                </TabsContent>
                <TabsContent value="shipment-history">
                    <ShipmentHistoryPage vendorShipments={vendorShipments} />
                </TabsContent>
                <TabsContent value="costings">
                    <CostingHistoryPage vendorName={data.vendorName} vendorCostings={vendorCostings} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
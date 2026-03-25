"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useVendorById } from "@/hooks/use-vendors"
import { use } from "react"
import { IconArrowLeft, IconBrandWhatsapp, IconFerry } from "@tabler/icons-react"
import DetailPageSkeleton from "@/components/detail-page-skeleton"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Dot } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import clsx from "clsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import VendorLocationForm from "@/components/forms/vendor-location-form"
import VendorContactForm from "@/components/forms/vendor-contact-form"
import ShipmentHistoryPage from "./(shipments)/shipment-history-page"
import CostingHistoryPage from "./(costings)/costing-history-page"

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
}

export default function CustomerDetailPage({ params }: { params: Promise<{ vendorId: string }> }) {
    const { vendorId } = use(params)
    const { data, isLoading, error } = useVendorById(vendorId)

    console.log(data)

    if (isLoading) return <DetailPageSkeleton />

    if (error) return <div>Error: {error.message}</div>

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
                            <p className="mt-2 font-bold text-xl">18</p>
                            <p className="mb-2 text-sm text-slate-500">Active <br /> Shipments</p>
                        </div>

                        <div className="w-full border-r">
                            <p className="mt-2 font-bold text-xl">18</p>
                            <p className="mb-2 text-sm text-slate-500">Total <br /> Assignments</p>
                        </div>

                        <div className="w-full border-r">
                            <p className="mt-2 font-bold text-xl">Rp. 4,000,000</p>
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
                    <TabsTrigger value="offices-and-contacts">Offices & Contacts <span className="bg-blue-100/50 text-blue-500 px-1 rounded-full">10</span></TabsTrigger>
                    <TabsTrigger value="shipment-history">Shipment History <span className="bg-blue-100/50 text-blue-500 px-1 rounded-full">100</span></TabsTrigger>
                    <TabsTrigger value="costings">Costings <span className="bg-blue-100/50 text-blue-500 px-1 rounded-full">20</span></TabsTrigger>
                </TabsList>
                <TabsContent value="offices-and-contacts">
                    <div className="flex flex-row items-center justify-between mb-4">
                        <p className="text-sm text-slate-500 my-2 flex flex-row">count offices <Dot /> count contacts</p>
                        <VendorLocationForm mode="create" id={undefined} addressLine1={undefined} addressLine2={undefined} addressLine3={undefined} city={undefined} province={undefined} country={undefined} postalCode={undefined} />
                    </div>
                    <Card>
                        <CardContent>
                            <div className="flex flex-row items-start justify-between">
                                <div>
                                    <div className="flex flex-row items-start gap-x-2">
                                        <h2 className="text-lg font-bold">Address Line 1</h2>
                                        <p className={clsx("text-xs font-medium rounded-full pl-1 pr-3 flex items-center w-fit mt-2", true ? "text-green-500 bg-green-100/50" : "bg-red-100/50 text-red-500")}><Dot className="animate-pulse"/> {true ? "Active" : "Inactive"}</p>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        <p>Address Line 2, Address Line 3, City, Province, Country Postal Code</p>
                                        <p>Last updated on date by name</p>
                                    </div>
                                </div>
                                <div className="flex flex-row items-start gap-x-2">
                                    <VendorLocationForm mode="edit" id={data.id} addressLine1={data.addressLine1} addressLine2={data.addressLine2} addressLine3={data.addressLine3} city={data.city} province={data.province} country={data.country} postalCode={data.postalCode} />
                                    <VendorContactForm mode="create" contactName={undefined} phoneNumber={undefined} email={undefined} isActive={undefined} />
                                </div>
                            </div>

                            <Separator className="mt-4"/>

                            <div>
                                <div className="flex flex-row items-center justify-between my-2">
                                    <div className="flex flex-row items-center gap-x-2">
                                        <Avatar>
                                            <AvatarFallback>FL</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h2 className="font-semibold text-sm">Contacts</h2>
                                            <p className="text-xs text-slate-500">Email</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center gap-x-2">
                                        <p className="text-sm text-slate-500">Phone Number</p>
                                        <Button variant="outline" size="icon" asChild><Link href={'#'} target="_blank"><IconBrandWhatsapp /></Link></Button>
                                        <VendorContactForm mode="edit" id={data.id} contactName={undefined} phoneNumber={undefined} email={undefined} isActive={undefined} />
                                    </div>
                                </div>

                                <Separator />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="shipment-history">
                    <ShipmentHistoryPage />
                </TabsContent>
                <TabsContent value="costings">
                    <CostingHistoryPage vendorName={data.vendorName} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
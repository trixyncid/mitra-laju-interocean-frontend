"use client"

import VendorContactForm from "@/components/forms/vendor-contact-form"
import VendorLocationForm from "@/components/forms/vendor-location-form"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useVendorById } from "@/hooks/use-vendors"
import { use } from "react"
import { IconBuildingCommunity } from "@tabler/icons-react"
import DetailPageSkeleton from "@/components/detail-page-skeleton"
import { formatDate } from "@/lib/utils"
import clsx from "clsx"

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

    const getTotalContacts = () => {
        let totalContacts = 0

        for (let i = 0; i < data.vendorLocations.length; i++) {
            totalContacts += data.vendorLocations[i].vendorContacts.length
        }
        return totalContacts
    }

    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="mb-5">
                <h1 className="text-xl font-bold">Vendor Detail - {data?.vendorName}</h1>
                <p className="text-slate-400 text-xs">Last updated on {formatDate(data?.updatedAt)} by {data?.updatedBy}</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-x-5">
                <Card>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <h4 className="mb-1 text-sm">Total Locations</h4>
                            <h2 className="text-xl font-semibold">{data?.vendorLocations?.length}</h2>
                        </div>

                        <div className="bg-blue-50 px-3 py-3 rounded-full">
                            <IconBuildingCommunity className="text-2xl text-blue-500"/>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <h4 className="mb-1 text-sm">Total Contacts</h4>
                            <h2 className="text-xl font-semibold">{getTotalContacts()}</h2>
                        </div>

                        <div className="bg-blue-50 px-3 py-3 rounded-full">
                            <IconBuildingCommunity className="text-2xl text-blue-500"/>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <h4 className="mb-1 text-sm text-slate-400">Total Locations</h4>
                            <h2 className="text-xl font-semibold">10</h2>
                        </div>

                        <div className="bg-blue-50 px-3 py-3 rounded-full">
                            <IconBuildingCommunity className="text-2xl text-blue-500"/>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Location Actions */}
            <div className="mt-10">
                <div className="flex items-center justify-between">
                    <Input type="text" placeholder="Search by location..." className="my-4 max-w-sm"/>
                    <VendorLocationForm mode="create" id={undefined} addressLine1={undefined} addressLine2={undefined} addressLine3={undefined} city={undefined} province={undefined} country={undefined} postalCode={undefined} />
                </div>
            </div>

            {/* Location List */}
            {
                data?.vendorLocations.map((location: VendorLocation) => (
                    <Accordion key={location.id} type="single" collapsible className="my-4">
                        <AccordionItem value="location-1">
                            <AccordionTrigger className="border border-slate-200 px-4 lg:px-6 flex items-center">
                                <div>
                                    <h3>{ location.addressLine1 }</h3>
                                    <p className="text-slate-400 text-xs">{location.city} {location.province}, {location.country}</p>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="border border-slate-100">
                                <div className="px-4 lg:px-6 py-4">
                                    <div className="flex items-center justify-between py-4">
                                        <h3 className="my-4 font-semibold">ASSOCIATED CONTACTS</h3>

                                        <VendorContactForm mode="create" contactName={undefined} phoneNumber={undefined} email={undefined} isActive={true} />
                                    </div>

                                    <table className="w-full px-4 lg:px-6 table-auto text-xs">
                                        <thead className="border-b border-t">
                                            <tr>
                                                <th className="text-left font-medium p-2 pl-8">Contact Name</th>
                                                <th className="text-left font-medium p-2">Phone Number</th>
                                                <th className="text-left font-medium p-2">Email</th>
                                                <th className="text-left font-medium p-2 pr-8">Status</th>
                                                <th className="text-left font-medium p-2 pr-8">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                location.vendorContacts.map((contact: VendorContact) => (
                                                    <tr className="border-b" key={contact.id}>
                                                        <td className="p-2 pl-8">{contact.contactName}</td>
                                                        <td className="p-2">{contact.phoneNumber}</td>
                                                        <td className="p-2">{contact.email}</td>
                                                        <td className="p-2 pr-8"><p className={clsx("px-3 py-1 w-fit rounded-full border font-semibold", contact.isActive ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500")}>{contact.isActive ? "Active" : "Inactive"}</p></td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                ))
            }
        </div>
    )
}
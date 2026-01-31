import CustomerContactForm from "@/components/forms/customer-contact-form"
import CustomerLocationForm from "@/components/forms/customer-location-form"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import CustomerForm from "@/components/forms/customer-form"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { IconBuildingCommunity } from "@tabler/icons-react"

export default async function CustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) {
    const { customerId } = await params
    
    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="mb-5">
                <h1 className="text-xl font-bold">Customer Detail - {`${customerId}`} </h1>
                <p>Details and information about customer ID asdf will be displayed here.</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-x-5">
                <Card>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <h4 className="mb-1 text-sm">Total Locations</h4>
                            <h2 className="text-xl font-semibold">10</h2>
                        </div>

                        <div className="bg-blue-50 px-3 py-3 rounded-full">
                            <IconBuildingCommunity className="text-2xl text-blue-500"/>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <h4 className="mb-1 text-sm">Total Locations</h4>
                            <h2 className="text-xl font-semibold">10</h2>
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
                    <CustomerLocationForm mode="create" id={undefined} addressLine1={undefined} addressLine2={undefined} addressLine3={undefined} city={undefined} province={undefined} country={undefined} postalCode={undefined} />
                </div>
            </div>

            {/* Location List */}
            <Accordion type="single" collapsible className="my-4">
                <AccordionItem value="location-1">
                    <AccordionTrigger className="border border-slate-200 px-4 lg:px-6 flex items-center">
                        <div>
                            <h3>Location 1</h3>
                            <p className="text-slate-400 text-xs">New Jersey, PHI, United States</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="border border-slate-100">
                        <div className="px-4 lg:px-6 py-4">
                            <div className="flex items-center justify-between py-4">
                                <h3 className="my-4 font-semibold">ASSOCIATED CONTACTS</h3>

                                <CustomerContactForm mode="create" contactName={undefined} phoneNumber={undefined} email={undefined} isActive={undefined} />
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
                                    <tr className="border-b">
                                        <td className="p-2 pl-8">Location A</td>
                                        <td className="p-2">08123456789</td>
                                        <td className="p-2">locationa@example.com</td>
                                        <td className="p-2 pr-8">Active</td>
                                        <td className="p-2 pr-8">
                                            <CustomerContactForm mode="edit" contactName={"Loc A"} phoneNumber={"08123456789"} email={"locationa@example.com"} isActive={true} />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { IconBuildingCommunity, IconEdit, IconNavigationPin, IconPlus } from "@tabler/icons-react"
import { DataTable } from "../data-table"
import { columns, CustomerContact } from "./columns"

async function getData(): Promise<CustomerContact[]> {
    return [
        {
            customerName: "Location A",
            phoneNumber: "08123456789",
            email: "location@email.com",
            isActive: true
        }
    ]
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) {
    const { customerId } = await params
    const data = await getData()

    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="mb-5">
                <h1 className="text-xl font-bold">Customer Detail - asdf </h1>
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
                    <Dialog>
                        <form>
                            <DialogTrigger asChild>
                                <Button><IconNavigationPin /> Add Location</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Location</DialogTitle>
                                </DialogHeader>
                                <div>
                                    <div className="my-3">
                                        <Label htmlFor="address" className="my-2">Address Line 1</Label>
                                        <Input name="addressLin1" />
                                    </div>
                                    <div className="my-3">
                                        <Label htmlFor="addressLine2" className="my-2">Address Line 2</Label>
                                        <Input name="addressLine2" />
                                    </div>
                                    <div className="my-3">
                                        <Label htmlFor="addressLine3" className="my-2">Address Line 3</Label>
                                        <Input name="addressLine3" />
                                    </div>
                                    <div className="my-3">
                                        <Label htmlFor="city" className="my-2">City</Label>
                                        <Input name="city" />
                                    </div>
                                    <div className="my-3">
                                        <Label htmlFor="state" className="my-2">State/Province</Label>
                                        <Input name="state" />
                                    </div>
                                    <div className="my-3">
                                        <Label htmlFor="country" className="my-2">Country</Label>
                                        <Input name="country" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit">Submit</Button>
                                </DialogFooter>
                            </DialogContent>
                        </form>
                    </Dialog>
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

                                <Dialog>
                                    <form>
                                        <DialogTrigger asChild>
                                            <Button className="mb-4"><IconPlus /> Add Contact</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add New Contact</DialogTitle>
                                            </DialogHeader>
                                            <div>
                                                <div className="my-3">
                                                    <Label htmlFor="contactName" className="my-2">Contact Name</Label>
                                                    <Input name="contactName" />
                                                </div>
                                                <div className="my-3">
                                                    <Label htmlFor="phoneNumber" className="my-2">Phone Number</Label>
                                                    <Input name="phoneNumber" />
                                                </div>
                                                <div className="my-3">
                                                    <Label htmlFor="email" className="my-2">Email</Label>
                                                    <Input name="email" />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline">Cancel</Button>
                                                </DialogClose>
                                                <Button type="submit">Submit</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </form>
                                </Dialog>
                            </div>

                            <table className="w-full px-4 lg:px-6 table-auto text-xs">
                                <thead className="border-b border-t">
                                    <tr>
                                        <th className="text-left font-medium p-2 pl-8">Customer Name</th>
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
                                            <Dialog>
                                                <form>
                                                    <DialogTrigger asChild>
                                                        <Button><IconEdit /></Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Edit Contact</DialogTitle>
                                                        </DialogHeader>
                                                        <div>
                                                            <div className="my-3">
                                                                <Label htmlFor="contactName" className="my-2">Contact Name</Label>
                                                                <Input name="contactName" />
                                                            </div>
                                                            <div className="my-3">
                                                                <Label htmlFor="phoneNumber" className="my-2">Phone Number</Label>
                                                                <Input name="phoneNumber" />
                                                            </div>
                                                            <div className="my-3">
                                                                <Label htmlFor="email" className="my-2">Email</Label>
                                                                <Input name="email" />
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white">Delete</Button>
                                                            <Button type="submit">Save Changes</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </form>
                                            </Dialog>
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
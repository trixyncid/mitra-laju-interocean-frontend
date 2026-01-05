import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPlus } from "@tabler/icons-react";
import { columns, Port } from "./columns";
import { DataTable } from "./data-table";

async function getData(): Promise<Port[]> {
    return [
        {
            portName: "Singapore",
            country: "Singapore",
            isActive: true
        },
        {
            portName: "Belawan",
            country: "Indonesia",
            isActive: true
        },
        {
            portName: "Los Angeles",
            country: "United States",
            isActive: true
        },
        {
            portName: "New York",
            country: "United States",
            isActive: true
        },
        {
            portName: "Long Beach",
            country: "United States",
            isActive: true
        },
        {
            portName: "Mumbai",
            country: "India",
            isActive: true
        },
        {
            portName: "Manzanillo",
            country: "Mexico",
            isActive: true
        },
        {
            portName: "Altamira",
            country: "Mexico",
            isActive: true
        },
        {
            portName: "Veracruz",
            country: "Mexico",
            isActive: true
        },
        {
            portName: "Busan",
            country: "Korea",
            isActive: true
        },
        {
            portName: "Surabaya",
            country: "Indonesia",
            isActive: true
        },
        {
            portName: "Makassar",
            country: "Indonesia",
            isActive: true
        },
        {
            portName: "Tanjong Priok",
            country: "Indonesia",
            isActive: true
        },
    ]
}

export default async function PortMasterDataPage() {
    const data = await getData()

    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Port Management</h1>
                    <p>View and manage global port destinations based on country, and port name.</p>
                </div>

                <Dialog>
                    <form>
                        <DialogTrigger asChild>
                            <Button><IconPlus /> Add Port</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Port</DialogTitle>
                            </DialogHeader>
                            <div>
                                <div className="my-3">
                                    <Label htmlFor="portName" className="my-2">Port Name</Label>
                                    <Input name="portName" />
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

            {/* Table */}
            <div className='container mx-auto py-10'>
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    )
}
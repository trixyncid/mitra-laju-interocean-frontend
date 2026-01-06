import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { IconPlus } from "@tabler/icons-react";
import { DataTable } from "./data-table";
import { columns, Shipment } from "./columns";

async function getData(): Promise<Shipment[]> {
    return [
        {
            orderNumber: "123",
            customerCode: "XHE",
            customerShipper: "Winsten",
            isActive: true
        }
    ]
}

export default async function ShipmentPage() {
    const data = await getData()

    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Shipment Management</h1>
                    <p>Manage shipments, track status, and record costs.</p>
                </div>

                <Dialog>
                    <form>
                        <DialogTrigger asChild>
                            <Button><IconPlus /> Add Shipment</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Shipment</DialogTitle>
                            </DialogHeader>
                            <div>
                                <div className="my-3">
                                    <Label htmlFor="orderNumber" className="my-2">Order Number</Label>
                                    <Input name="orderNumber" />
                                </div>
                                <div className="my-3">
                                    <Label htmlFor="customerCode" className="my-2">Customer Code</Label>
                                    <Select>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select customer code" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Customer Name (Code)</SelectLabel>
                                                <SelectItem value="value">Apple</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="my-3">
                                    <Label htmlFor="customerCode" className="my-2">Shipper</Label>
                                    <Select>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select customer shipper" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Customer Name (Code)</SelectLabel>
                                                <SelectItem value="value">Apple</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
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
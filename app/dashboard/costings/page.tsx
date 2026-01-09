import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconPlus } from "@tabler/icons-react";
import { columns, Costing } from "./columns"
import { DataTable } from "./data-table";

async function getData(): Promise<Costing[]> {
    return [
        {
            id: "1",
            date: "",
            description: "",
            vendorName: "",
            orderNumber: null,
            status: "",
            amount: 100
        }
    ]
}

export default async function CostingPage() {
    const data = await getData()

    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Costing Entries</h1>
                    <p>Manage all costings and assign unlinked costings.</p>
                </div>

                <Dialog>
                    <form>
                        <DialogTrigger asChild>
                            <Button>
                                <IconPlus />
                                Add Costing
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Costing</DialogTitle>
                            </DialogHeader>
                            <div className="">
                                <Label htmlFor="" className="mb-2">Description</Label>
                                <Input type="text" placeholder="Enter a description" />
                            </div>
                            <div className="">
                                <Label htmlFor="" className="mb-2">Price</Label>
                                <Input type="text" placeholder="Enter a description" />
                            </div>
                            <div className="">
                                <Label htmlFor="" className="mb-2">Currency</Label>
                                <Input type="text" placeholder="Enter a description" />
                            </div>
                            <div className="">
                                <Label htmlFor="" className="mb-2">Container Number</Label>
                                <Input type="text" placeholder="Enter a description" />
                            </div>
                            <div className=" flex items-start gap-3">
                                <Checkbox />
                                <div className="grid gap-2">
                                    <Label htmlFor="" className="terms-2">VAT (PPN)</Label>
                                    <p className="text-sm text-gray-500">By clicking this checkbox, the VAT will be included in the calculation.</p>
                                </div>
                            </div>
                            <div className=" flex items-start gap-3">
                                <Checkbox />
                                <div className="grid gap-2">
                                    <Label htmlFor="" className="terms-2">PPh 23</Label>
                                    <p className="text-sm text-gray-500">By clicking this checkbox, the PPh 23 will be included in the calculation.</p>
                                </div>
                            </div>
                            <div className="">
                                <Label htmlFor="" className="mb-2">Vendor Invoice</Label>
                                <Input type="text" placeholder="" />
                            </div>
                            <div className="">
                                <Label htmlFor="" className="mb-2">Vendor Name</Label>
                                <Select>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select customer shipper" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Vendor Name (Code)</SelectLabel>
                                            <SelectItem value="value">Apple</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
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

            {/* Costing List */}
            <div className='container mx-auto py-10'>
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    )
}
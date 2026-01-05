import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPlus } from "@tabler/icons-react";
import { columns, Vessel } from "./columns";
import { DataTable } from "./data-table";

async function getData(): Promise<Vessel[]> {
    return [
        {
            vesselName: "ABC123",
            voyage: "456",
            etd: "",
            closingReefer: "",
            isActive: true
        },
        {
            vesselName: "DEF123",
            voyage: "456",
            etd: "",
            closingReefer: "",
            isActive: true
        },
        {
            vesselName: "GHI123",
            voyage: "456",
            etd: "",
            closingReefer: "",
            isActive: true
        },
    ]
}

export default async function VesselMasterDataPage() {
    const data = await getData()

    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Vessel Management</h1>
                    <p>View and manage vessels based on name, voyage, etd, and closing reefer.</p>
                </div>

                <Dialog>
                    <form>
                        <DialogTrigger asChild>
                            <Button><IconPlus /> Add Vessel</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Vessel</DialogTitle>
                            </DialogHeader>
                            <div>
                                <div className="my-3">
                                    <Label htmlFor="portName" className="my-2">Vessel Name</Label>
                                    <Input name="portName" type="text"/>
                                </div>
                                <div className="my-3">
                                    <Label htmlFor="country" className="my-2">Voyage</Label>
                                    <Input name="country" type="text"/>
                                </div>
                                <div className="my-3">
                                    <Label htmlFor="country" className="my-2">ETD</Label>
                                    <Input name="etd" type="date" />
                                </div>
                                <div className="my-3">
                                    <Label htmlFor="country" className="my-2">Closing Reefer</Label>
                                    <Input name="country" type="date"/>
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
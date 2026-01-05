import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPlus } from "@tabler/icons-react";
import { DataTable } from "./data-table";
import { columns, Customer } from "./columns";

async function getData(): Promise<Customer[]> {
    return [
        {
            customerCode: "WIN",
            customerName: "PT Winsten",
            npwp: "1234567",
            isActive: true
        }
    ]
}

export default async function CustomerMasterDataPage() {
    const data = await getData()

    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Customer Management</h1>
                    <p>View and manage your client database, view profiles, and update contact information.</p>
                </div>

                <Dialog>
                    <form>
                        <DialogTrigger asChild>
                            <Button><IconPlus /> Add Customer</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Customer</DialogTitle>
                            </DialogHeader>
                            <div>
                                <div className="my-3">
                                    <Label htmlFor="customerCode" className="my-2">Customer Code</Label>
                                    <Input name="customerCode" />
                                </div>
                                <div className="my-3">
                                    <Label htmlFor="customerName" className="my-2">Customer Name</Label>
                                    <Input name="customerName" />
                                </div>
                                <div className="my-3">
                                    <Label htmlFor="npwp" className="my-2">NPWP</Label>
                                    <Input name="npwp" />
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
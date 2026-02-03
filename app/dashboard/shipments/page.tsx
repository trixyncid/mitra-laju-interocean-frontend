import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { IconPlus } from "@tabler/icons-react";
import { DataTable } from "./data-table";
import { columns, Shipment } from "./columns";
import ShipmentForm from "@/components/forms/shipment-form";

async function getData(): Promise<Shipment[]> {
    return [
        {
            id: "1",
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

                <ShipmentForm mode="create" orderNumber={undefined} customerCode={undefined} customerShipper={undefined} />
            </div>

            {/* Table */}
            <div className='container mx-auto py-10'>
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    )
}
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPlus } from "@tabler/icons-react";
import { columns, Vessel } from "./columns";
import { DataTable } from "./data-table";
import VesselForm from "@/components/forms/vessel-form";

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

                <VesselForm mode="create" vesselName={undefined} voyage={undefined} etd={undefined} closingReefer={undefined} />
            </div>

            {/* Table */}
            <div className='container mx-auto py-10'>
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    )
}
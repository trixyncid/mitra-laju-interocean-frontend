import { DataTable } from "./data-table";
import { columns, Vendor } from "./columns";
import VendorForm from "@/components/forms/vendor-form";

async function getData(): Promise<Vendor[]> {
    return [
        {
            id: "1",
            vendorCode: "V001",
            vendorName: "ABC Supplies",
            npwp: "123456789",
            isActive: true
        },
        {
            id: "2",
            vendorCode: "V002",
            vendorName: "Global Traders",
            npwp: "987654321",
            isActive: false
        },
        {
            id: "3",
            vendorCode: "V003",
            vendorName: "Logistics Co.",
            npwp: null,
            isActive: true
        },
        {
            id: "4",
            vendorCode: "V004",
            vendorName: "Freight Masters",
            npwp: "456789123",
            isActive: true
        },
    ]
}

export default async function VendorMasterDataPage() {
    const data = await getData();

    return (
        <div className="px-4 lg:px-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">Vendor Management</h1>
                        <p>View and manage vendors based on vendor code, name, NPWP, and status.</p>
                    </div>

                    <div>
                        <VendorForm mode="create" vendorName={undefined} vendorCode={undefined} npwp={undefined} isActive={true} />
                    </div>
                </div>

                {/* Table */}
                <div className='container mx-auto py-10'>
                    <DataTable columns={columns} data={data} />
                </div>
            </div>
    )
}
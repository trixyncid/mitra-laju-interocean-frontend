import { columns, Port } from "./columns";
import { DataTable } from "./data-table";
import PortForm from "@/components/forms/port-form";

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

                <PortForm mode="create" portName="" country="" />
            </div>

            {/* Table */}
            <div className='container mx-auto py-10'>
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    )
}
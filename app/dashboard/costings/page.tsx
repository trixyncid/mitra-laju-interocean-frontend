import { columns, Costing } from "./columns"
import { DataTable } from "./data-table";
import CostingForm from "@/components/forms/costing-form";

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

                <CostingForm mode="create" description={undefined} price={undefined} currency={undefined} containerNumber={undefined} vat={undefined} pph23={undefined} vendorInvoiceNumber={undefined} vendorName={undefined} />
            </div>

            {/* Costing List */}
            <div className='container mx-auto py-10'>
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    )
}
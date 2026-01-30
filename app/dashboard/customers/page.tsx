import { DataTable } from "./data-table";
import { columns, Customer } from "./columns";
import CustomerForm from "@/components/forms/customer-form";

async function getData(): Promise<Customer[]> {
    return [
        {
            id: "13",
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

                <CustomerForm mode="create" customerCode={undefined} customerName={undefined} npwp={undefined} />
            </div>

            {/* Table */}
            <div className='container mx-auto py-10'>
                <DataTable columns={columns} data={data} />
            </div>
        </div>
    )
}
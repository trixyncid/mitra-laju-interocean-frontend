"use client"

import { DataTable } from "./data-table";
import { columns } from "./columns";
import CustomerForm from "@/components/forms/customer-form";
import { useCustomers } from "@/hooks/use-customers";
import TableSkeleton from "@/components/table-skeleton";
import ErrorPage from "@/components/error-page";

export default function CustomerMasterDataPage() {
    const { data, isLoading, error } = useCustomers()

    if (error) return <ErrorPage />

    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Customer Management</h1>
                    <p>View and manage your client database, view profiles, and update contact information.</p>
                </div>

                <CustomerForm mode="create" id={undefined} customerCode={undefined} customerName={undefined} npwp={undefined} isActive={true} />
            </div>

            {/* Table */}
            <div className='container mx-auto py-10'>
                { isLoading ? <TableSkeleton /> : <DataTable columns={columns} data={data} />}
            </div>
        </div>
    )
}
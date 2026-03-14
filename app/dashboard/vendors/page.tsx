"use client"

import { DataTable } from "./data-table";
import { columns } from "./columns";
import VendorForm from "@/components/forms/vendor-form";
import { useVendors } from "@/hooks/use-vendors";
import TableSkeleton from "@/components/table-skeleton";
import ErrorPage from "@/components/error-page";

export default function VendorMasterDataPage() {
    const { data, isLoading, error } = useVendors();

    if (error) return <ErrorPage />

    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="flex items-center justify-between container mx-auto">
                <div>
                    <h1 className="text-xl font-bold">Vendor Management</h1>
                    <p>View and manage vendors based on vendor code, name, NPWP, and status.</p>
                </div>

                <div>
                    <VendorForm mode="create" id={undefined} vendorName={undefined} vendorCode={undefined} npwp={undefined} isActive={true} />
                </div>
            </div>

            {/* Table */}
            <div className='container mx-auto py-10'>
                { isLoading ? <TableSkeleton /> : <DataTable columns={columns} data={data} />}
            </div>
        </div>
    )
}
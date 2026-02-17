"use client"

import { columns } from "./columns";
import { DataTable } from "./data-table";
import PortForm from "@/components/forms/port-form";
import { usePorts } from "@/hooks/use-ports";
import TableSkeleton from "@/components/table-skeleton";
import ErrorPage from "@/components/error-page";

export default function PortMasterDataPage() {
    const { data, isLoading, error } = usePorts()

    if (error) return <ErrorPage />

    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Port Management</h1>
                    <p>View and manage global port destinations based on country, and port name.</p>
                </div>

                <PortForm mode="create" portName={undefined} portCountry={undefined} isActive={true} id={undefined} />
            </div>

            {/* Table */}
            <div className='container mx-auto py-10'>
                { isLoading ? <TableSkeleton /> : <DataTable columns={columns} data={data} />}
            </div>
        </div>
    )
}
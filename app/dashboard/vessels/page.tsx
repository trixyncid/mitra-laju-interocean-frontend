"use client"

import { useVessels } from "@/hooks/use-vessels";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import VesselForm from "@/components/forms/vessel-form";
import TableSkeleton from "@/components/loading/table-skeleton";
import ErrorPage from "@/components/error-page";

export default function VesselMasterDataPage() {
    const { data, isLoading, error } = useVessels()

    if (error) return <ErrorPage />

    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Vessel Management</h1>
                    <p>View and manage vessels based on name, voyage, etd, and closing reefer.</p>
                </div>

                <VesselForm mode="create" id={undefined} vesselName={undefined} voyageNumber={undefined} etd={undefined} closingReefer={undefined} isActive={true} />
            </div>

            {/* Table */}
            <div className='container mx-auto py-10'>
                { isLoading ? <TableSkeleton /> : <DataTable columns={columns} data={data} />}
            </div>
        </div>
    )
}
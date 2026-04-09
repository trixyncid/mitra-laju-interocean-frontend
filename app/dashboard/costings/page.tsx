"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table";
import CostingForm from "@/components/forms/costing-form";
import { useCostings } from "@/hooks/use-costings";
import TableSkeleton from "@/components/table-skeleton";

export default function CostingPage() {
    const { data: costings, isLoading: isLoadingCostings, error: errorCostings } = useCostings()
    
    if (isLoadingCostings) return <TableSkeleton />

    console.log(costings)

    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Costing Entries</h1>
                    <p>Manage all costings and assign unlinked costings.</p>
                </div>

                <CostingForm mode="create" id={undefined} description={undefined} price={undefined} currency={undefined} containerId={undefined} vatPercentage={undefined} pph23Percentage={undefined} vendorInvoiceNumber={undefined} vendorId={undefined} />
            </div>

            {/* Costing List */}
            <div className='container mx-auto py-10'>
                <DataTable columns={columns} data={costings} />
            </div>
        </div>
    )
}
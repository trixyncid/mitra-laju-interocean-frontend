"use client"

import { columns, Costing } from "./columns"
import { DataTable } from "./data-table";
import CostingForm from "@/components/forms/costing-form";
import { useCostings } from "@/hooks/use-costings";
import TableSkeleton from "@/components/loading/table-skeleton";
import ErrorPage from "@/components/error-page";

export default function CostingPage() {
    const { data: costings, isLoading: isLoadingCostings, error: errorCostings } = useCostings()

    if (errorCostings) return <ErrorPage />

    const costingNumberAssignment = (data: Costing[]) => {
        const monthInRomans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]

        const month = new Date().getMonth() + 1
        const year = new Date().getFullYear()
        const romanMonth = monthInRomans[month - 1]

        const maxNumber = (data ?? []).reduce((max: number, costing: Costing) => {
            const parts = costing.costingNumber?.split("/")
            if (!parts || parts.length !== 3) return max
            if (parts[1] === romanMonth && parts[2] === year.toString()) {
                const num = parseInt(parts[0], 10)
                return isNaN(num) ? max : Math.max(max, num)
            }
            return max
        }, 0)

        return `${maxNumber + 1}/${romanMonth}/${year}`
    }

    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Costing Entries</h1>
                    <p>Manage all costings and assign unlinked costings.</p>
                </div>

                <CostingForm mode="create" id={undefined} costingNumber={costingNumberAssignment(costings)} description={undefined} price={undefined} currency={undefined} containerId={undefined} vatPercentage={undefined} pph23Percentage={undefined} vendorInvoiceNumber={undefined} vendorId={undefined} />
            </div>

            {/* Costing List */}
            <div className='container mx-auto py-10'>
                { isLoadingCostings ? <TableSkeleton /> : <DataTable columns={columns} data={costings} />}
            </div>
        </div>
    )
}
import { DataTable } from "./costing-data-table"
import { columns } from "./costing-column"
import { Costing } from "./costing-column"

export default function CostingHistoryPage({ vendorName, vendorCostings }: { vendorName: string, vendorCostings: Costing[] }) {
    return (
        <div className="container mx-auto">
            <h1 className="py-4">Costing History - {vendorName}</h1>
            <DataTable columns={columns} data={vendorCostings} />
        </div>
    )
}
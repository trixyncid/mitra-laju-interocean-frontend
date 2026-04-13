import { DataTable } from "./costing-data-table"
import { columns } from "./costing-column"
import { Costing } from "./costing-column"

export default function CostingHistoryPage({ customerName, customerCostings }: { customerName: string, customerCostings: Costing[] }) {
    return (
        <div className="container mx-auto">
            <h1 className="py-4 font-bold">Costing History - {customerName}</h1>
            <DataTable columns={columns} data={customerCostings} />
        </div>
    )
}
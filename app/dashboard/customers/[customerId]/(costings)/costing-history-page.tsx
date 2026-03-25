import { DataTable } from "./costing-data-table"
import { columns } from "./costing-column"

export default function CostingHistoryPage({ vendorName }: { vendorName: string }) {
    const data = [
        {
            id: "1",
            invoiceNumber: "123",
            shipmentOrderNumber: "123",
            amount: 100,
        },
        {
            id: "2",
            invoiceNumber: "456",
            shipmentOrderNumber: "456",
            amount: 200,
        },
    ]
    return (
        <div className="container mx-auto">
            <h1 className="py-4">Costing History - {vendorName}</h1>
            <DataTable columns={columns} data={data} />
        </div>
    )
}
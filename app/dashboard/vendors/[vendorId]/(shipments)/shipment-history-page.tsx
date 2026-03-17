import { columns } from "./shipment-columns"
import { DataTable } from "./shipment-data-table"

function getData() {
    return [
        {
            id: "1",
            orderNumber: "123",
            customerCode: "XHE",
            customerShipper: "Winsten",
        },
        {
            id: "2",
            orderNumber: "456",
            customerCode: "XHE",
            customerShipper: "Winsten",
        }
    ]
}

export default function ShipmentHistoryPage() {
    const data = getData()
 
  return (
    <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
    </div>
  )
}
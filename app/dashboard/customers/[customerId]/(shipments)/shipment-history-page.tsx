import { columns } from "./shipment-columns"
import { DataTable } from "./shipment-data-table"

function getData() {
    return [
        {
            id: "1",
            orderNumber: "123",
            customerCode: "XHE",
            customerShipper: "Winsten",
            departureCountry: "Philippines",
            arrivalCountry: "United States",
        },
        {
            id: "2",
            orderNumber: "456",
            customerCode: "XHE",
            customerShipper: "Winsten",
            departureCountry: "Philippines",
            arrivalCountry: "United States",
        },
        {
            id: "3",
            orderNumber: "789",
            customerCode: "XHE",
            customerShipper: "Winsten",
            departureCountry: "Philippines",
            arrivalCountry: "United States",
        }
    ]
}

export default function ShipmentHistoryPage() {
    const data = getData()
 
  return (
    <div className="container mx-auto">
        <DataTable columns={columns} data={data} />
    </div>
  )
}
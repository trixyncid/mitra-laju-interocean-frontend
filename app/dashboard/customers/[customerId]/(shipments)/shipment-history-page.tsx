import { columns } from "./shipment-columns"
import { DataTable } from "./shipment-data-table"
import { LinkedShipment } from "./shipment-columns"

export default function ShipmentHistoryPage({ customerShipments }: { customerShipments: LinkedShipment[] }) {
    return (
        <div className="container mx-auto">
            <DataTable columns={columns} data={customerShipments} />
        </div>
    )
}
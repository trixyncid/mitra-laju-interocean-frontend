import { columns, LinkedShipment } from "./shipment-columns"
import { DataTable } from "./shipment-data-table"

export default function ShipmentHistoryPage({ vendorShipments }: { vendorShipments: LinkedShipment[] }) { 
  return (
    <div className="container mx-auto">
        <DataTable columns={columns} data={vendorShipments} />
    </div>
  )
}
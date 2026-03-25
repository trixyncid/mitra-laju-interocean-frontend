"use client"

import { DataTable } from "./data-table";
import { columns } from "./columns";
import ShipmentForm from "@/components/forms/shipment-form";
import { useShipments } from "@/hooks/use-shipments";

export default function ShipmentPage() {
    const { data, isLoading, error } = useShipments()

    console.log(data)

    if (error) return <div>Error: {error.message}</div>

    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Shipments</h1>
                    <p>Count active shipments</p>
                </div>

                <ShipmentForm mode="create" orderNumber={undefined} customerCode={undefined} customerShipper={undefined} />
            </div>

            {/* Table */}
            <div className='container mx-auto py-10'>
                { isLoading ? <div>Loading...</div> : <DataTable columns={columns} data={data} />}
            </div>
        </div>
    )
}
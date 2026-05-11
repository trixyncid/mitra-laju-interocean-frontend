"use client"

import { DataTable } from "./data-table";
import { columns, Shipment } from "./columns";
import ShipmentForm from "@/components/forms/shipment-form";
import { useShipments } from "@/hooks/use-shipments";
import TableSkeleton from "@/components/loading/table-skeleton";

export default function ShipmentPage() {
    const { data, isLoading, error } = useShipments()

    if (error) return <div>Error: {error.message}</div>

    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Shipments</h1>
                    <p>{ data?.filter((shipment: Shipment) => shipment.isActive).length } active shipments</p>
                </div>

                <ShipmentForm mode="create" id={undefined} orderNumber={undefined} customerCodeId={undefined} customerShipperId={undefined} isActive={undefined} />
            </div>

            {/* Table */}
            <div className='container mx-auto py-10'>
                { isLoading ? <TableSkeleton /> : <DataTable columns={columns} data={data} />}
            </div>
        </div>
    )
}
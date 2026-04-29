"use client"

import { DataTable } from "./data-table";
import { columns, Shipment } from "./columns";
import ShipmentForm from "@/components/forms/shipment-form";
import { useShipments } from "@/hooks/use-shipments";
import TableSkeleton from "@/components/loading/table-skeleton";

export default function ShipmentPage() {
    const { data, isLoading, error } = useShipments()

    if (error) return <div>Error: {error.message}</div>

    /**
     * Function to assign order numbers to shipments: Order number is in the format of <count>/<month in romans>/<year>.
     * The count is the number of shipments for the month and year.
     * The month is in romans.
     * The year is the current year.
     */
    const orderNumberAssignment = (data: Shipment[]) => {
        const monthInRomans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
    
        const month = new Date().getMonth() + 1
        const year = new Date().getFullYear()
        const romanMonth = monthInRomans[month - 1]
    
        const maxNumber = (data ?? []).reduce((max: number, shipment: Shipment) => {
            const parts = shipment.orderNumber?.split("/")
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
                    <h1 className="text-xl font-bold">Shipments</h1>
                    <p>{ data?.filter((shipment: Shipment) => shipment.isActive).length } active shipments</p>
                </div>

                <ShipmentForm mode="create" id={undefined} orderNumber={orderNumberAssignment(data)} customerCodeId={undefined} customerShipperId={undefined} isActive={undefined} />
            </div>

            {/* Table */}
            <div className='container mx-auto py-10'>
                { isLoading ? <TableSkeleton /> : <DataTable columns={columns} data={data} />}
            </div>
        </div>
    )
}
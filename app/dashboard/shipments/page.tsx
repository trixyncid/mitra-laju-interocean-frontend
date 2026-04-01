"use client"

import { DataTable } from "./data-table";
import { columns, Shipment } from "./columns";
import ShipmentForm from "@/components/forms/shipment-form";
import { useShipments } from "@/hooks/use-shipments";

export default function ShipmentPage() {
    const { data, isLoading, error } = useShipments()

    if (error) return <div>Error: {error.message}</div>

    console.log(data)

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
        const count = data?.filter((shipment: Shipment) => shipment.orderNumber.split("/")[2] === year.toString() && shipment.orderNumber.split("/")[1] === monthInRomans[month - 1].toString()).length + 1
        return `${count}/${monthInRomans[month - 1]}/${year}`
    }
    
    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Shipments</h1>
                    <p>Count active shipments</p>
                </div>

                <ShipmentForm mode="create" id={undefined} orderNumber={orderNumberAssignment(data)} customerCodeId={undefined} customerShipperId={undefined} />
            </div>

            {/* Table */}
            <div className='container mx-auto py-10'>
                { isLoading ? <div>Loading...</div> : <DataTable columns={columns} data={data} />}
            </div>
        </div>
    )
}
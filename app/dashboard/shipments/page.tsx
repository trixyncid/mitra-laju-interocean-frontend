"use client"

import { columns, type Shipment } from "./columns"
import { DataTable } from "./data-table"
import ShipmentForm from "@/components/forms/shipment-form"
import { useShipments } from "@/hooks/use-shipments"
import TableSkeleton from "@/components/loading/table-skeleton"
import ErrorPage from "@/components/error-page"
import {
    DashboardPage,
    DashboardPageCard,
    DashboardPageHeader,
} from "@/components/layout/dashboard-page"

export default function ShipmentPage() {
    const { data, isLoading, error } = useShipments()
    const activeCount = data?.filter((shipment: Shipment) => shipment.isActive).length ?? 0

    if (error) return <ErrorPage />

    return (
        <DashboardPage>
            <DashboardPageHeader
                title="Shipment Management"
                description={`${activeCount} active shipments. View and manage shipments, operational data, and linked transactions.`}
                action={
                    <ShipmentForm
                        mode="create"
                        id={undefined}
                        orderNumber={undefined}
                        customerCodeId={undefined}
                        customerShipperId={undefined}
                        isActive={undefined}
                    />
                }
            />
            <DashboardPageCard>
                {isLoading ? <TableSkeleton /> : <DataTable columns={columns} data={data} />}
            </DashboardPageCard>
        </DashboardPage>
    )
}

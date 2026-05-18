"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import CostingForm from "@/components/forms/costing-form"
import { useCostings } from "@/hooks/use-costings"
import TableSkeleton from "@/components/loading/table-skeleton"
import ErrorPage from "@/components/error-page"
import {
    DashboardPage,
    DashboardPageCard,
    DashboardPageHeader,
} from "@/components/layout/dashboard-page"

export default function CostingPage() {
    const { data, isLoading, error } = useCostings()

    if (error) return <ErrorPage />

    return (
        <DashboardPage>
            <DashboardPageHeader
                title="Costing Entries"
                description="Manage costing entries, vendor invoices, and shipment links."
                action={
                    <CostingForm
                        mode="create"
                        id={undefined}
                        costingNumber={undefined}
                        description={undefined}
                        price={undefined}
                        currency={undefined}
                        containerId={undefined}
                        vatPercentage={undefined}
                        pph23Percentage={undefined}
                        vendorInvoiceNumber={undefined}
                        vendorId={undefined}
                        shipmentId={null}
                    />
                }
            />
            <DashboardPageCard>
                {isLoading ? <TableSkeleton /> : <DataTable columns={columns} data={data} />}
            </DashboardPageCard>
        </DashboardPage>
    )
}

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
import { PermissionGate } from "@/components/permission-gate"

export default function CostingPage() {
    const { data, isLoading, error } = useCostings()

    if (error) return <ErrorPage message={error.message} />

    return (
        <DashboardPage>
            <DashboardPageHeader
                title="Costing Entries"
                description="Manage costing entries, vendor invoices, and shipment links."
                action={
                    <PermissionGate resource="costings" write>
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
                    </PermissionGate>
                }
            />
            <DashboardPageCard>
                {isLoading ? <TableSkeleton /> : <DataTable columns={columns} data={data ?? []} />}
            </DashboardPageCard>
        </DashboardPage>
    )
}

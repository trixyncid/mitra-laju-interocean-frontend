"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import SellingForm from "@/components/forms/selling-form"
import { useSellings } from "@/hooks/use-sellings"
import TableSkeleton from "@/components/loading/table-skeleton"
import ErrorPage from "@/components/error-page"
import {
    DashboardPage,
    DashboardPageCard,
    DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"

export default function SellingPage() {
    const { data: sellings, isLoading, error } = useSellings()

    if (error) return <ErrorPage message={error.message} />

    return (
        <DashboardPage>
            <DashboardPageHeader
                title="Selling Entries"
                description="Manage all selling entries and link them to shipments."
                action={
                    <PermissionGate resource="sellings" write>
                    <SellingForm
                        mode="create"
                        id={undefined}
                        sellingNumber={undefined}
                        description={undefined}
                        amount={undefined}
                        vatPercentage={undefined}
                        pph23Percentage={undefined}
                    />
                    </PermissionGate>
                }
            />
            <DashboardPageCard>
                {isLoading ? <TableSkeleton /> : <DataTable columns={columns} data={sellings ?? []} />}
            </DashboardPageCard>
        </DashboardPage>
    )
}

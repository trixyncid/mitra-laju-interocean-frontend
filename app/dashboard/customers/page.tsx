"use client"

import { DataTable } from "./data-table";
import { columns } from "./columns";
import CustomerForm from "@/components/forms/customer-form";
import { useCustomers } from "@/hooks/use-customers";
import TableSkeleton from "@/components/loading/table-skeleton";
import ErrorPage from "@/components/error-page";
import {
    DashboardPage,
    DashboardPageCard,
    DashboardPageHeader,
} from "@/components/layout/dashboard-page";
import { PermissionGate } from "@/components/permission-gate";

export default function CustomerMasterDataPage() {
    const { data, isLoading, error } = useCustomers()

    if (error) return <ErrorPage />

    return (
        <DashboardPage>
            <DashboardPageHeader
                title="Customer Management"
                description="View and manage your client database, view profiles, and update contact information."
                action={
                    <PermissionGate resource="masterData" write>
                        <CustomerForm mode="create" id={undefined} customerCode={undefined} customerName={undefined} npwp={undefined} isActive={true} />
                    </PermissionGate>
                }
            />
            <DashboardPageCard>
                {isLoading ? <TableSkeleton /> : <DataTable columns={columns} data={data} />}
            </DashboardPageCard>
        </DashboardPage>
    )
}

"use client"

import { DataTable } from "./data-table";
import { columns } from "./columns";
import VendorForm from "@/components/forms/vendor-form";
import { useVendors } from "@/hooks/use-vendors";
import TableSkeleton from "@/components/loading/table-skeleton";
import ErrorPage from "@/components/error-page";
import {
    DashboardPage,
    DashboardPageCard,
    DashboardPageHeader,
} from "@/components/layout/dashboard-page";
import { PermissionGate } from "@/components/permission-gate";

export default function VendorMasterDataPage() {
    const { data, isLoading, error } = useVendors();

    if (error) return <ErrorPage />

    return (
        <DashboardPage>
            <DashboardPageHeader
                title="Vendor Management"
                description="View and manage vendors based on vendor code, name, NPWP, and status."
                action={
                    <PermissionGate resource="masterData" write>
                        <VendorForm mode="create" id={undefined} vendorName={undefined} vendorCode={undefined} npwp={undefined} isActive={true} />
                    </PermissionGate>
                }
            />
            <DashboardPageCard>
                {isLoading ? <TableSkeleton /> : <DataTable columns={columns} data={data} />}
            </DashboardPageCard>
        </DashboardPage>
    )
}

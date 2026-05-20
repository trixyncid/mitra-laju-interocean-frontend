"use client"

import { useVessels } from "@/hooks/use-vessels";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import VesselForm from "@/components/forms/vessel-form";
import TableSkeleton from "@/components/loading/table-skeleton";
import ErrorPage from "@/components/error-page";
import {
    DashboardPage,
    DashboardPageCard,
    DashboardPageHeader,
} from "@/components/layout/dashboard-page";
import { PermissionGate } from "@/components/permission-gate";

export default function VesselMasterDataPage() {
    const { data, isLoading, error } = useVessels()

    if (error) return <ErrorPage />

    return (
        <DashboardPage>
            <DashboardPageHeader
                title="Vessel Management"
                description="View and manage vessels based on name, voyage, ETD, and closing reefer."
                action={
                    <PermissionGate resource="masterData" write>
                        <VesselForm
                            mode="create"
                            id={undefined}
                            vesselName={undefined}
                            voyageNumber={undefined}
                            etd={undefined}
                            closingReefer={undefined}
                            isActive={true}
                        />
                    </PermissionGate>
                }
            />
            <DashboardPageCard>
                {isLoading ? <TableSkeleton /> : <DataTable columns={columns} data={data} />}
            </DashboardPageCard>
        </DashboardPage>
    )
}

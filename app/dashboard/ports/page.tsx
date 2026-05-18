"use client"

import { columns } from "./columns";
import { DataTable } from "./data-table";
import PortForm from "@/components/forms/port-form";
import { usePorts } from "@/hooks/use-ports";
import TableSkeleton from "@/components/loading/table-skeleton";
import ErrorPage from "@/components/error-page";
import {
    DashboardPage,
    DashboardPageCard,
    DashboardPageHeader,
} from "@/components/layout/dashboard-page";

export default function PortMasterDataPage() {
    const { data, isLoading, error } = usePorts()

    if (error) return <ErrorPage />

    return (
        <DashboardPage>
            <DashboardPageHeader
                title="Port Management"
                description="View and manage global port destinations based on country and port name."
                action={
                    <PortForm mode="create" portName={undefined} portCountry={undefined} isActive={true} id={undefined} />
                }
            />
            <DashboardPageCard>
                {isLoading ? <TableSkeleton /> : <DataTable columns={columns} data={data} />}
            </DashboardPageCard>
        </DashboardPage>
    )
}

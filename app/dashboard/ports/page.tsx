"use client"

import { useMemo } from "react"
import { columns } from "./columns";
import { DataTable } from "./data-table";
import PortForm from "@/components/forms/port-form";
import { usePorts } from "@/hooks/use-ports";
import { usePersistedTableState } from "@/hooks/use-persisted-table-state";
import TableSkeleton from "@/components/loading/table-skeleton";
import ErrorPage from "@/components/error-page";
import {
    DashboardPage,
    DashboardPageCard,
    DashboardPageHeader,
} from "@/components/layout/dashboard-page";
import { PermissionGate } from "@/components/permission-gate";

export default function PortMasterDataPage() {
    const {
        applied,
        page,
        pageSize,
        setApplied,
        setPage,
        setPageSize,
        isRestored,
    } = usePersistedTableState("ports")
    const params = useMemo(
        () => ({
            page,
            pageSize,
            search: applied.search || undefined,
            status: applied.status as "all" | "true" | "false",
            from: applied.dateRange.from,
            to: applied.dateRange.to,
        }),
        [page, pageSize, applied]
    )
    const { data, isLoading, error } = usePorts(params, isRestored)
    const ports = data?.items ?? []
    const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }

    if (error) return <ErrorPage />

    return (
        <DashboardPage atmosphere>
            <DashboardPageHeader
                title="Port Management"
                description="View and manage global port destinations based on country and port name."
                action={
                    <PermissionGate resource="masterData" write>
                        <PortForm mode="create" portName={undefined} portCountry={undefined} isActive={true} id={undefined} />
                    </PermissionGate>
                }
            />
            <DashboardPageCard>
                {!isRestored || isLoading ? (
                    <TableSkeleton />
                ) : (
                    <DataTable
                        columns={columns}
                        data={ports}
                        page={pagination.page}
                        pageSize={pagination.pageSize}
                        totalPages={pagination.totalPages}
                        totalRows={pagination.total}
                        applied={applied}
                        onApply={setApplied}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                    />
                )}
            </DashboardPageCard>
        </DashboardPage>
    )
}

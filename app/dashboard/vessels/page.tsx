"use client"

import { useMemo, useState } from "react"
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
import { type AppliedTableFilters } from "@/components/data-table-toolbar";

export default function VesselMasterDataPage() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [applied, setApplied] = useState<AppliedTableFilters>({
        search: "",
        status: "all",
        dateRange: {},
    })
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
    const { data, isLoading, error } = useVessels(params)
    const vessels = data?.items ?? []
    const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }

    if (error) return <ErrorPage />

    return (
        <DashboardPage atmosphere>
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
                {isLoading ? (
                    <TableSkeleton />
                ) : (
                    <DataTable
                        columns={columns}
                        data={vessels}
                        page={pagination.page}
                        pageSize={pagination.pageSize}
                        totalPages={pagination.totalPages}
                        totalRows={pagination.total}
                        applied={applied}
                        onApply={(next) => {
                            setApplied(next)
                            setPage(1)
                        }}
                        onPageChange={setPage}
                        onPageSizeChange={(next) => {
                            setPageSize(next)
                            setPage(1)
                        }}
                    />
                )}
            </DashboardPageCard>
        </DashboardPage>
    )
}

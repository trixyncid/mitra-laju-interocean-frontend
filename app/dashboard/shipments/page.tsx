"use client"

import { useMemo, useState } from "react"
import { columns } from "./columns"
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
import { PermissionGate } from "@/components/permission-gate"
import { type AppliedTableFilters } from "@/components/data-table-toolbar"

export default function ShipmentPage() {
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

    const { data, isLoading, error } = useShipments(params)
    const shipments = data?.items ?? []
    const pagination = data?.pagination ?? {
        page,
        pageSize,
        total: 0,
        totalPages: 1,
    }

    const handleApply = (next: AppliedTableFilters) => {
        setApplied(next)
        setPage(1)
    }

    if (error) return <ErrorPage message={error.message} />

    return (
        <DashboardPage>
            <DashboardPageHeader
                title="Shipment Management"
                description={`${pagination.total} shipments. View and manage shipments, operational data, and linked transactions.`}
                action={
                    <PermissionGate resource="shipments" write>
                        <ShipmentForm
                            mode="create"
                            id={undefined}
                            orderNumber={undefined}
                            customerCodeId={undefined}
                            customerShipperId={undefined}
                            status={undefined}
                            isActive={undefined}
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
                        data={shipments}
                        page={pagination.page}
                        pageSize={pagination.pageSize}
                        totalPages={pagination.totalPages}
                        totalRows={pagination.total}
                        applied={applied}
                        onApply={handleApply}
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

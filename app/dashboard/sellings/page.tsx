"use client"

import { useMemo } from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import SellingForm from "@/components/forms/selling-form"
import { useSellings } from "@/hooks/use-sellings"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
import TableSkeleton from "@/components/loading/table-skeleton"
import ErrorPage from "@/components/error-page"
import {
    DashboardPage,
    DashboardPageCard,
    DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"

export default function SellingPage() {
    const {
        applied,
        page,
        pageSize,
        setApplied,
        setPage,
        setPageSize,
        isRestored,
    } = usePersistedTableState("sellings")
    const params = useMemo(
        () => ({
            page,
            pageSize,
            search: applied.search || undefined,
            status: applied.status as "all" | "PAID" | "UNPAID",
            from: applied.dateRange.from,
            to: applied.dateRange.to,
        }),
        [page, pageSize, applied]
    )
    const { data, isLoading, error } = useSellings(params, isRestored)
    const sellings = data?.items ?? []
    const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }

    if (error) return <ErrorPage message={error.message} />

    return (
        <DashboardPage atmosphere>
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
                {!isRestored || isLoading ? (
                    <TableSkeleton />
                ) : (
                    <DataTable
                        columns={columns}
                        data={sellings}
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

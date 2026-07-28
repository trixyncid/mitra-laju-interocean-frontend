"use client"

import { useMemo, useState } from "react"
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
import { type AppliedTableFilters } from "@/components/data-table-toolbar"

export default function SellingPage() {
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
            status: applied.status as "all" | "PAID" | "UNPAID",
            from: applied.dateRange.from,
            to: applied.dateRange.to,
        }),
        [page, pageSize, applied]
    )
    const { data, isLoading, error } = useSellings(params)
    const sellings = data?.items ?? []
    const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }

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
                {isLoading ? (
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

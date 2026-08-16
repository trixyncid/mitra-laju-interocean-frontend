"use client"

import { useMemo, useState } from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import CostingForm from "@/components/forms/costing-form"
import { useCostings } from "@/hooks/use-costings"
import TableSkeleton from "@/components/loading/table-skeleton"
import ErrorPage from "@/components/error-page"
import {
    DashboardPage,
    DashboardPageCard,
    DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"
import { type AppliedTableFilters } from "@/components/data-table-toolbar"

export default function CostingPage() {
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
    const { data, isLoading, error } = useCostings(params)
    const costings = data?.items ?? []
    const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }

    if (error) return <ErrorPage message={error.message} />

    return (
        <DashboardPage atmosphere>
            <DashboardPageHeader
                title="Costing Entries"
                description="Manage costing entries, vendor invoices, and shipment links."
                action={
                    <PermissionGate resource="costings" write>
                    <CostingForm
                        mode="create"
                        id={undefined}
                        costingNumber={undefined}
                        description={undefined}
                        price={undefined}
                        currencyCode={undefined}
                        currency={undefined}
                        containerNumber={undefined}
                        vatPercentage={undefined}
                        pph23Percentage={undefined}
                        vendorInvoiceNumber={undefined}
                        vendorId={undefined}
                        shipmentId={null}
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
                        data={costings}
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

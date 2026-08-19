"use client"

import { useMemo } from "react"
import Link from "next/link"
import { IconPlus } from "@tabler/icons-react"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useShipments } from "@/hooks/use-shipments"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
import TableSkeleton from "@/components/loading/table-skeleton"
import ErrorPage from "@/components/error-page"
import { Button } from "@/components/ui/button"
import {
    DashboardPage,
    DashboardPageCard,
    DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"

export default function ShipmentPage() {
    const {
        applied,
        page,
        pageSize,
        setApplied,
        setPage,
        setPageSize,
        isRestored,
    } = usePersistedTableState("shipments")

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

    const { data, isLoading, error } = useShipments(params, isRestored)
    const shipments = data?.items ?? []
    const pagination = data?.pagination ?? {
        page,
        pageSize,
        total: 0,
        totalPages: 1,
    }

    if (error) return <ErrorPage message={error.message} />

    return (
        <DashboardPage atmosphere>
            <DashboardPageHeader
                title="Shipment Management"
                description={`${pagination.total} shipments. View and manage shipments, operational data, and linked transactions.`}
                action={
                    <PermissionGate resource="shipments" write>
                        <Button asChild>
                            <Link href="/dashboard/shipments/new">
                                <IconPlus className="size-4" />
                                Add Shipment
                            </Link>
                        </Button>
                    </PermissionGate>
                }
            />
            <DashboardPageCard>
                {!isRestored || isLoading ? (
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
                        onApply={setApplied}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                    />
                )}
            </DashboardPageCard>
        </DashboardPage>
    )
}

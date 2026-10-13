"use client"

import { useMemo } from "react"
import { IconAnchor } from "@tabler/icons-react"

import type { Port } from "./columns"
import PortForm from "@/components/forms/port-form"
import { usePorts } from "@/hooks/use-ports"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
import TableSkeleton from "@/components/loading/table-skeleton"
import ErrorPage from "@/components/error-page"
import {
    DashboardPage,
    DashboardPageCard,
    DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"
import { DataTableToolbar } from "@/components/data-table-toolbar"
import { PortAtlas } from "@/components/reference/port-atlas"
import { ReferenceEmpty } from "@/components/reference/reference-empty"
import { ReferencePager } from "@/components/reference/reference-pager"
import { ACTIVE_STATUS_OPTIONS, type TableFilterConfig } from "@/lib/data-table-filters"

const portFilters: TableFilterConfig<Port> = {
    status: {
        id: "isActive",
        label: "Status",
        options: ACTIVE_STATUS_OPTIONS,
        getValue: (row) => row.isActive,
    },
}

export default function PortMasterDataPage() {
    // Ports are grouped by country, so a bigger page keeps whole countries together.
    const {
        applied,
        page,
        pageSize,
        setApplied,
        setPage,
        setPageSize,
        isRestored,
    } = usePersistedTableState("ports.atlas", 50)
    const params = useMemo(
        () => ({
            page,
            pageSize,
            search: applied.search || undefined,
            status: applied.status as "all" | "true" | "false",
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
                title="Port atlas"
                description="Every port you ship from or to, grouped by country. Ports that are not in use stay in old shipments but cannot be chosen for new ones."
                action={
                    <PermissionGate resource="masterData" write>
                        <PortForm mode="create" portName={undefined} portCountry={undefined} isActive={true} id={undefined} />
                    </PermissionGate>
                }
            />
            <DashboardPageCard>
                <DataTableToolbar
                    searchPlaceholder="Search by port name..."
                    filters={portFilters}
                    applied={applied}
                    onApply={setApplied}
                />
                {!isRestored || isLoading ? (
                    <TableSkeleton />
                ) : ports.length === 0 ? (
                    <ReferenceEmpty
                        icon={<IconAnchor />}
                        title="No ports found"
                        description="Try another name, or clear the filters."
                    />
                ) : (
                    <div className="space-y-6">
                        <PortAtlas ports={ports} partial={pagination.totalPages > 1} />
                        <ReferencePager
                            className="border-t border-border/70 pt-4"
                            page={pagination.page}
                            pageSize={pagination.pageSize}
                            totalPages={pagination.totalPages}
                            total={pagination.total}
                            noun="ports"
                            onPageChange={setPage}
                            onPageSizeChange={setPageSize}
                        />
                    </div>
                )}
            </DashboardPageCard>
        </DashboardPage>
    )
}

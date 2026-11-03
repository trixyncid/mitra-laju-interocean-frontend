"use client"

import { Suspense, useMemo } from "react"
import Link from "next/link"
import { IconLayoutColumns, IconPlus, IconTable } from "@tabler/icons-react"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useShipments } from "@/hooks/use-shipments"
import { useLinkedView } from "@/hooks/use-linked-view"
import { usePersistedChoice } from "@/hooks/use-persisted-choice"
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
import { ShipmentFilterProvider, shipmentFilterParams } from "@/components/shipments/shipment-filter-provider"
import { groupSortParams, useShipmentGroupBy } from "@/components/shipments/shipment-grouping"
import { ShipmentWorkspace } from "@/components/shipments/shipment-workspace"
import { cn } from "@/lib/utils"

type ViewMode = "split" | "table"

function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (view: ViewMode) => void }) {
    const options = [
        { value: "split" as const, label: "Split view", icon: IconLayoutColumns },
        { value: "table" as const, label: "Table", icon: IconTable },
    ]
    return (
        <div role="radiogroup" aria-label="View" className="flex h-10 items-center rounded-full bg-card p-1">
            {options.map(({ value, label, icon: Icon }) => (
                <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={view === value}
                    onClick={() => onChange(value)}
                    className={cn(
                        "flex h-full cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors",
                        view === value
                            ? "brand-fill"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Icon className="size-4" />
                    {value === "split" ? (
                        <>
                            <span className="lg:hidden">List</span>
                            <span className="hidden lg:inline">{label}</span>
                        </>
                    ) : (
                        label
                    )}
                </button>
            ))}
        </div>
    )
}

function ShipmentsContent() {
    const {
        applied,
        page,
        pageSize,
        setApplied,
        setPage,
        setPageSize,
        isRestored,
    } = usePersistedTableState("shipments")
    const [savedView, saveView] = usePersistedChoice<ViewMode>(
        "mli:shipments:view",
        ["split", "table"],
        "table"
    )
    const [view, setView] = useLinkedView(savedView, saveView, "shipment", "split")
    const [groupBy, setGroupBy] = useShipmentGroupBy()

    // Both views filter by the Excel-style column filters (and search) only.
    const params = useMemo(
        () => ({ page, pageSize, ...shipmentFilterParams(applied), ...groupSortParams(groupBy, applied) }),
        [page, pageSize, applied, groupBy]
    )

    // The split view loads its own batches; the paged query only serves the table.
    const { data, isLoading, error } = useShipments(params, isRestored && view === "table")
    const shipments = data?.items ?? []
    const pagination = data?.pagination ?? {
        page,
        pageSize,
        total: 0,
        totalPages: 1,
    }

    if (error) return <ErrorPage message={error.message} />

    return (
        <DashboardPage>
            <DashboardPageHeader
                className="mb-5 lg:mb-6"
                title="Shipment Management"
                description="View and manage shipments, operational data, and linked transactions."
                action={
                    <div className="flex flex-wrap items-center gap-2">
                        <ViewToggle view={view} onChange={setView} />
                        <PermissionGate resource="shipments" write>
                            <Button asChild>
                                <Link href="/dashboard/shipments/new">
                                    <IconPlus className="size-4" />
                                    Add Shipment
                                </Link>
                            </Button>
                        </PermissionGate>
                    </div>
                }
            />
            {view === "split" ? (
                isRestored ? (
                    <ShipmentWorkspace applied={applied} onApply={setApplied} enabled={isRestored} />
                ) : (
                    <TableSkeleton />
                )
            ) : (
                <DashboardPageCard>
                    {!isRestored || isLoading ? (
                        <TableSkeleton />
                    ) : (
                        <ShipmentFilterProvider
                            applied={applied}
                            onChange={({ columns: nextColumns, sort }) =>
                                setApplied({ ...applied, columns: nextColumns, sort })
                            }
                        >
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
                                groupBy={groupBy}
                                onGroupByChange={(next) => {
                                    setGroupBy(next)
                                    setPage(1)
                                }}
                            />
                        </ShipmentFilterProvider>
                    )}
                </DashboardPageCard>
            )}
        </DashboardPage>
    )
}

export default function ShipmentPage() {
    return (
        <Suspense fallback={null}>
            <ShipmentsContent />
        </Suspense>
    )
}

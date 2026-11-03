"use client"

import { useMemo } from "react"
import { IconLayoutList, IconShip, IconTable } from "@tabler/icons-react"

import { useVessels } from "@/hooks/use-vessels"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import VesselForm from "@/components/forms/vessel-form"
import TableSkeleton from "@/components/loading/table-skeleton"
import ErrorPage from "@/components/error-page"
import {
    DashboardPage,
    DashboardPageCard,
    DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"
import { DataTableToolbar } from "@/components/data-table-toolbar"
import { ActiveColumnFilters, ColumnFilterBar } from "@/components/column-filter/column-filter"
import { VesselExportButton } from "@/components/vessels/vessel-export-button"
import { VESSEL_FILTER_BAR } from "@/components/vessels/vessel-filter-fields"
import { VesselFilterProvider, vesselFilterParams } from "@/components/vessels/vessel-filter-provider"
import { ReferenceEmpty } from "@/components/reference/reference-empty"
import { ReferencePager } from "@/components/reference/reference-pager"
import { SailingSchedule } from "@/components/reference/sailing-schedule"
import { useStoredView } from "@/components/reference/use-stored-view"
import { cn } from "@/lib/utils"

const VIEWS = ["schedule", "table"] as const

export default function VesselMasterDataPage() {
    const [view, setView] = useStoredView("mli:vessels-view", VIEWS, "schedule")
    const {
        applied,
        page,
        pageSize,
        setApplied,
        setPage,
        setPageSize,
        isRestored,
    } = usePersistedTableState("vessels", 50)
    // Status and dates are column filters now; both views share them.
    const params = useMemo(
        () => ({ page, pageSize, ...vesselFilterParams(applied) }),
        [page, pageSize, applied]
    )
    const { data, isLoading, error } = useVessels(params, isRestored)
    const vessels = data?.items ?? []
    const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }

    if (error) return <ErrorPage />

    return (
        <DashboardPage atmosphere>
            <DashboardPageHeader
                title="Sailing schedule"
                description="Vessels and voyages in order of departure (ETD), with the last day to bring reefer containers."
                action={
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <div role="radiogroup" aria-label="View" className="flex rounded-full surface p-1">
                            {VIEWS.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    role="radio"
                                    aria-checked={view === option}
                                    onClick={() => setView(option)}
                                    className={cn(
                                        "flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors",
                                        view === option
                                            ? "brand-fill text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {option === "schedule" ? <IconLayoutList className="size-4" /> : <IconTable className="size-4" />}
                                    {option === "schedule" ? "Schedule" : "Table"}
                                </button>
                            ))}
                        </div>
                        <PermissionGate resource="masterData" write>
                            <VesselForm
                                mode="create"
                                id={undefined}
                                vesselName={undefined}
                                voyageNumber={undefined}
                                etd={undefined}
                                eta={undefined}
                                closingReefer={undefined}
                                isActive={true}
                            />
                        </PermissionGate>
                    </div>
                }
            />
            <DashboardPageCard>
                <VesselFilterProvider
                    applied={applied}
                    onChange={({ columns: nextColumns, sort }) => setApplied({ ...applied, columns: nextColumns, sort })}
                >
                    {view === "table" ? (
                        !isRestored || isLoading ? (
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
                                onApply={setApplied}
                                onPageChange={setPage}
                                onPageSizeChange={setPageSize}
                            />
                        )
                    ) : (
                        <>
                            <DataTableToolbar
                                searchPlaceholder="Search vessel or voyage..."
                                applied={applied}
                                onApply={setApplied}
                                extra={<VesselExportButton applied={applied} totalRows={pagination.total} />}
                            />
                            <ColumnFilterBar items={VESSEL_FILTER_BAR} className="mb-3" />
                            <ActiveColumnFilters />
                            {!isRestored || isLoading ? (
                                <TableSkeleton />
                            ) : vessels.length === 0 ? (
                                <ReferenceEmpty
                                    icon={<IconShip />}
                                    title="No vessels found"
                                    description="Try another name or date, or clear the filters."
                                />
                            ) : (
                                <div className="space-y-6">
                                    <SailingSchedule vessels={vessels} partial={pagination.totalPages > 1} />
                                    <ReferencePager
                                        className="border-t border-border/70 pt-4"
                                        page={pagination.page}
                                        pageSize={pagination.pageSize}
                                        totalPages={pagination.totalPages}
                                        total={pagination.total}
                                        noun="vessels"
                                        onPageChange={setPage}
                                        onPageSizeChange={setPageSize}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </VesselFilterProvider>
            </DashboardPageCard>
        </DashboardPage>
    )
}

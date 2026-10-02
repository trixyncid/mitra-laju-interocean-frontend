"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { IconPlus } from "@tabler/icons-react"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import { breakdownColumns } from "./breakdown-columns"
import { BreakdownDataTable } from "./breakdown-data-table"
import {
  useCostingBreakdowns,
  useCostings,
} from "@/hooks/use-costings"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"
import TableSkeleton from "@/components/loading/table-skeleton"
import ErrorPage from "@/components/error-page"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { glassTabsTrigger } from "@/lib/design"

type CostingListTab = "invoices" | "breakdowns"

function CostingInvoicesTable() {
  const {
    applied,
    page,
    pageSize,
    setApplied,
    setPage,
    setPageSize,
    isRestored,
  } = usePersistedTableState("costings.invoices")
  const params = useMemo(
    () => ({
      page,
      pageSize,
      search: applied.search || undefined,
      status: applied.status as "all" | "PAID" | "UNPAID",
      vendorId: applied.vendorId || undefined,
      from: applied.date || undefined,
      to: applied.date || undefined,
      paymentDate: applied.paymentDate || undefined,
    }),
    [page, pageSize, applied]
  )
  const { data, isLoading, error } = useCostings(params, isRestored)
  const costings = data?.items ?? []
  const pagination = data?.pagination ?? {
    page,
    pageSize,
    total: 0,
    totalPages: 1,
  }

  if (error) return <ErrorPage message={error.message} />

  return !isRestored || isLoading ? (
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
      onApply={setApplied}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
    />
  )
}

function CostingLinesTable() {
  const {
    applied,
    page,
    pageSize,
    setApplied,
    setPage,
    setPageSize,
    isRestored,
  } = usePersistedTableState("costings.breakdowns")
  const assigned = (applied.lifecycleStatus ?? "all") as
    | "all"
    | "linked"
    | "unlinked"
  const params = useMemo(
    () => ({
      page,
      pageSize,
      search: applied.search || undefined,
      status: applied.status as "all" | "PAID" | "UNPAID",
      assigned,
      vendorId: applied.vendorId || undefined,
      from: applied.date || undefined,
      to: applied.date || undefined,
      paymentDate: applied.paymentDate || undefined,
    }),
    [page, pageSize, applied, assigned]
  )
  const { data, isLoading, error } = useCostingBreakdowns(params, isRestored)
  const lines = data?.items ?? []
  const pagination = data?.pagination ?? {
    page,
    pageSize,
    total: 0,
    totalPages: 1,
  }

  if (error) return <ErrorPage message={error.message} />

  return !isRestored || isLoading ? (
    <TableSkeleton />
  ) : (
    <BreakdownDataTable
      columns={breakdownColumns}
      data={lines}
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
}

export default function CostingPage() {
  const [tab, setTab] = useState<CostingListTab>("invoices")

  return (
    <DashboardPage atmosphere>
      <DashboardPageHeader
        title="Vendor costings"
        description="Record vendor invoices, split them into breakdowns, then assign each one to a shipment."
        action={
          <PermissionGate resource="costings" write>
            <Button asChild>
              <Link href="/dashboard/costings/new">
                <IconPlus className="size-4" />
                New costing
              </Link>
            </Button>
          </PermissionGate>
        }
      />
      <DashboardPageCard>
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as CostingListTab)}
        >
          <TabsList className="mb-4 h-auto min-w-max rounded-md border border-[rgba(214,227,255,0.45)] bg-[rgba(232,238,246,0.55)] p-1 backdrop-blur-xl">
            <TabsTrigger value="invoices" className={glassTabsTrigger}>
              Invoices
            </TabsTrigger>
            <TabsTrigger value="breakdowns" className={glassTabsTrigger}>
              Breakdowns
            </TabsTrigger>
          </TabsList>
          <TabsContent value="invoices">
            <CostingInvoicesTable />
          </TabsContent>
          <TabsContent value="breakdowns">
            <CostingLinesTable />
          </TabsContent>
        </Tabs>
      </DashboardPageCard>
    </DashboardPage>
  )
}

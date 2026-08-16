"use client"

import { useMemo, useState } from "react"
import { createContainerLookupColumns } from "./columns"
import { DataTable } from "./data-table"
import ContainerLookupForm from "@/components/forms/container-lookup-form"
import { useContainerLookups } from "@/hooks/use-container-lookups"
import TableSkeleton from "@/components/loading/table-skeleton"
import ErrorPage from "@/components/error-page"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"
import { type AppliedTableFilters } from "@/components/data-table-toolbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { glassTabsTrigger } from "@/lib/design"
import type { ContainerLookupKind } from "@/services/container-lookups.service"

const emptyFilters: AppliedTableFilters = {
  search: "",
  status: "all",
  dateRange: {},
}

function ContainerLookupTable({ kind }: { kind: ContainerLookupKind }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [applied, setApplied] = useState<AppliedTableFilters>(emptyFilters)
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
  const { data, isLoading, error } = useContainerLookups(kind, params)
  const items = data?.items ?? []
  const pagination = data?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }
  const columns = useMemo(() => createContainerLookupColumns(kind), [kind])

  if (error) return <ErrorPage />

  return isLoading ? (
    <TableSkeleton />
  ) : (
    <DataTable
      kind={kind}
      columns={columns}
      data={items}
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
  )
}

export default function ContainerMasterDataPage() {
  const [tab, setTab] = useState<ContainerLookupKind>("size")

  return (
    <DashboardPage atmosphere>
      <DashboardPageHeader
        title="Container Management"
        description="Configure container sizes and types used when recording shipment containers."
        action={
          <PermissionGate resource="masterData" write>
            <ContainerLookupForm
              key={tab}
              kind={tab}
              mode="create"
              name={undefined}
              isActive={true}
              id={undefined}
            />
          </PermissionGate>
        }
      />
      <DashboardPageCard>
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as ContainerLookupKind)}
        >
          <TabsList className="mb-4 h-auto min-w-max rounded-md border border-[rgba(214,227,255,0.45)] bg-[rgba(232,238,246,0.55)] p-1 backdrop-blur-xl">
            <TabsTrigger value="size" className={glassTabsTrigger}>
              Size
            </TabsTrigger>
            <TabsTrigger value="type" className={glassTabsTrigger}>
              Type
            </TabsTrigger>
          </TabsList>
          <TabsContent value="size">
            <ContainerLookupTable kind="size" />
          </TabsContent>
          <TabsContent value="type">
            <ContainerLookupTable kind="type" />
          </TabsContent>
        </Tabs>
      </DashboardPageCard>
    </DashboardPage>
  )
}

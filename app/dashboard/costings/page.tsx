"use client"

import { Suspense } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import TableSkeleton from "@/components/loading/table-skeleton"
import { CostingFormDialog } from "@/components/costings/costing-form-dialog"
import { CostingWorkspace } from "@/components/costings/costing-workspace"
import { CostingTable } from "@/components/costings/costing-table"
import { LineViewToggle, type LineViewMode } from "@/components/costings/line-view-toggle"
import { DashboardPage, DashboardPageCard, DashboardPageHeader } from "@/components/layout/dashboard-page"
import { CostingWriteGate } from "@/components/write-gates"
import { useLinkedView } from "@/hooks/use-linked-view"
import { usePersistedChoice } from "@/hooks/use-persisted-choice"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"

function CostingsContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { applied, setApplied, page, pageSize, setPage, setPageSize, isRestored } = usePersistedTableState("costings")
  const [savedView, saveView] = usePersistedChoice<LineViewMode>("mli:costings:view", ["split", "table"], "table")
  const [view, setView] = useLinkedView(savedView, saveView, "costing", "split")
  const openNew = searchParams.get("new") === "1"

  const showCosting = (id: string | null, dropNew = true) => {
    const params = new URLSearchParams(searchParams.toString())
    if (id) params.set("costing", id)
    if (dropNew) params.delete("new")
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        className="mb-5 lg:mb-6"
        title="Costing"
        description="Each line is a cost you expect from a vendor. Match vendor invoice lines to see what was actually billed."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <LineViewToggle view={view} onChange={setView} />
            <CostingWriteGate>
              <CostingFormDialog
                mode="create"
                defaultOpen={openNew}
                onOpenChange={(open) => {
                  if (!open && openNew) showCosting(null)
                }}
                onSaved={(costing) => showCosting(costing.id)}
              />
            </CostingWriteGate>
          </div>
        }
      />
      {!isRestored ? (
        <TableSkeleton />
      ) : view === "split" ? (
        <CostingWorkspace applied={applied} onApply={setApplied} enabled={isRestored} />
      ) : (
        <DashboardPageCard>
          <CostingTable
            applied={applied}
            onApply={setApplied}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </DashboardPageCard>
      )}
    </DashboardPage>
  )
}

export default function CostingsPage() {
  return (
    <Suspense fallback={null}>
      <CostingsContent />
    </Suspense>
  )
}

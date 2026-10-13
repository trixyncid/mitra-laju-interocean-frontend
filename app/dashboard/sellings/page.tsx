"use client"

import { Suspense } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import TableSkeleton from "@/components/loading/table-skeleton"
import { LineViewToggle, type LineViewMode } from "@/components/costings/line-view-toggle"
import { DashboardPage, DashboardPageCard, DashboardPageHeader } from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"
import { SellingFormDialog } from "@/components/sellings/selling-form-dialog"
import { SellingTable } from "@/components/sellings/selling-table"
import { SellingWorkspace } from "@/components/sellings/selling-workspace"
import { useLinkedView } from "@/hooks/use-linked-view"
import { usePersistedChoice } from "@/hooks/use-persisted-choice"
import { usePersistedTableState } from "@/hooks/use-persisted-table-state"

function SellingsContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { applied, setApplied, page, pageSize, setPage, setPageSize, isRestored } = usePersistedTableState("sellingLines")
  const [savedView, saveView] = usePersistedChoice<LineViewMode>("mli:sellings:view", ["split", "table"], "table")
  const [view, setView] = useLinkedView(savedView, saveView, "selling", "split")
  const openNew = searchParams.get("new") === "1"

  const showSelling = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (id) params.set("selling", id)
    params.delete("new")
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        className="mb-5 lg:mb-6"
        title="Selling"
        description="What you charge each customer. Link the costings a charge recovers to see its margin."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <LineViewToggle view={view} onChange={setView} />
            <PermissionGate resource="sellings" write>
              <SellingFormDialog
                mode="create"
                defaultOpen={openNew}
                onOpenChange={(open) => {
                  if (!open && openNew) showSelling(null)
                }}
                onSaved={(selling) => showSelling(selling.id)}
              />
            </PermissionGate>
          </div>
        }
      />
      {!isRestored ? (
        <TableSkeleton />
      ) : view === "split" ? (
        <SellingWorkspace applied={applied} onApply={setApplied} enabled={isRestored} />
      ) : (
        <DashboardPageCard>
          <SellingTable
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

export default function SellingsPage() {
  return (
    <Suspense fallback={null}>
      <SellingsContent />
    </Suspense>
  )
}

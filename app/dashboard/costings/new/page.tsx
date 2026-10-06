"use client"

import Link from "next/link"
import { IconArrowLeft } from "@tabler/icons-react"

import CostingCreateForm from "@/components/forms/costing-create-form"
import { CostingCreateSidebar } from "@/components/costing-create-sidebar"
import { Button } from "@/components/ui/button"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"

export default function NewCostingPage() {
  return (
    <PermissionGate resource="costings" write>
      <DashboardPage atmosphere>
        <DashboardPageHeader
          title="New vendor costing"
          description="Start from the vendor invoice, then add each charge as its own line."
          action={
            <Button variant="outline" asChild>
              <Link href="/dashboard/costings">
                <IconArrowLeft className="size-4" />
                Back to costings
              </Link>
            </Button>
          }
        />
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
          <aside className="lg:sticky lg:top-6">
            <CostingCreateSidebar />
          </aside>
          <DashboardPageCard>
            <CostingCreateForm />
          </DashboardPageCard>
        </div>
      </DashboardPage>
    </PermissionGate>
  )
}

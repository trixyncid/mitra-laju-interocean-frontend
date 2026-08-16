"use client"

import Link from "next/link"
import { IconArrowLeft } from "@tabler/icons-react"

import ShipmentCreateForm from "@/components/forms/shipment-create-form"
import { ShipmentCreateSidebar } from "@/components/shipment-create-sidebar"
import { Button } from "@/components/ui/button"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"

export default function NewShipmentPage() {
  return (
    <PermissionGate resource="shipments" write>
      <DashboardPage atmosphere>
        <DashboardPageHeader
          title="Add Shipment"
          description="Create a shipment with customer details and operational route in one step."
          action={
            <Button variant="outline" asChild>
              <Link href="/dashboard/shipments">
                <IconArrowLeft className="size-4" />
                Back to shipments
              </Link>
            </Button>
          }
        />
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
          <aside className="lg:sticky lg:top-6">
            <ShipmentCreateSidebar />
          </aside>
          <DashboardPageCard>
            <ShipmentCreateForm />
          </DashboardPageCard>
        </div>
      </DashboardPage>
    </PermissionGate>
  )
}

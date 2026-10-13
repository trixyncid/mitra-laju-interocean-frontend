"use client"

import Link from "next/link"
import { IconArrowLeft } from "@tabler/icons-react"

import ShipmentCreateForm from "@/components/forms/shipment-create-form"
import { Button } from "@/components/ui/button"
import { DashboardPage, DashboardPageHeader } from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"

export default function NewShipmentPage() {
  return (
    <PermissionGate resource="shipments" write>
      <DashboardPage atmosphere>
        <DashboardPageHeader
          title="New shipment"
          description="Four short steps. The booking card fills in as you type, so you can check everything before you save."
          action={
            <Button variant="outline" asChild>
              <Link href="/dashboard/shipments">
                <IconArrowLeft className="size-4" />
                Back to shipments
              </Link>
            </Button>
          }
        />
        <ShipmentCreateForm />
      </DashboardPage>
    </PermissionGate>
  )
}

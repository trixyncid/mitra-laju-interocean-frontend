"use client"

import Link from "next/link"
import { IconArrowLeft } from "@tabler/icons-react"

import VendorForm from "@/components/forms/vendor-form"
import { VendorCreateSidebar } from "@/components/vendor-create-sidebar"
import { Button } from "@/components/ui/button"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"

export default function NewVendorPage() {
  return (
    <PermissionGate resource="masterData" write>
      <DashboardPage atmosphere>
        <DashboardPageHeader
          title="Add Vendor"
          description="Create a new vendor profile with code, name, shipment type, and tax details."
          action={
            <Button variant="outline" asChild>
              <Link href="/dashboard/vendors">
                <IconArrowLeft className="size-4" />
                Back to vendors
              </Link>
            </Button>
          }
        />
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
          <aside className="lg:sticky lg:top-6">
            <VendorCreateSidebar />
          </aside>
          <DashboardPageCard>
            <VendorForm mode="create" />
          </DashboardPageCard>
        </div>
      </DashboardPage>
    </PermissionGate>
  )
}

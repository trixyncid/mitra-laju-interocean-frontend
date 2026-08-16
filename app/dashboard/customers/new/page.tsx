"use client"

import Link from "next/link"
import { IconArrowLeft } from "@tabler/icons-react"

import CustomerForm from "@/components/forms/customer-form"
import { CustomerCreateSidebar } from "@/components/customer-create-sidebar"
import { Button } from "@/components/ui/button"
import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"

export default function NewCustomerPage() {
  return (
    <PermissionGate resource="masterData" write>
      <DashboardPage atmosphere>
        <DashboardPageHeader
          title="Add Customer"
          description="Create a new customer profile with code, name, shipment type, and tax details."
          action={
            <Button variant="outline" asChild>
              <Link href="/dashboard/customers">
                <IconArrowLeft className="size-4" />
                Back to customers
              </Link>
            </Button>
          }
        />
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
          <aside className="lg:sticky lg:top-6">
            <CustomerCreateSidebar />
          </aside>
          <DashboardPageCard>
            <CustomerForm mode="create" />
          </DashboardPageCard>
        </div>
      </DashboardPage>
    </PermissionGate>
  )
}

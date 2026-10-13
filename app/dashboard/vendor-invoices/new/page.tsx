"use client"

import Link from "next/link"
import { IconArrowLeft } from "@tabler/icons-react"

import VendorInvoiceCreateForm from "@/components/forms/vendor-invoice-create-form"
import { Button } from "@/components/ui/button"
import { DashboardPage, DashboardPageHeader } from "@/components/layout/dashboard-page"
import { PermissionGate } from "@/components/permission-gate"

export default function NewVendorInvoicePage() {
  return (
    <PermissionGate resource="vendor-invoices" write>
      <DashboardPage atmosphere>
        <DashboardPageHeader
          title="New vendor invoice"
          description="Type in the vendor's invoice and its charges. The paper on the right shows how it will look and what we have to pay."
          action={
            <Button variant="outline" asChild>
              <Link href="/dashboard/vendor-invoices">
                <IconArrowLeft className="size-4" />
                Back to vendor invoices
              </Link>
            </Button>
          }
        />
        <VendorInvoiceCreateForm />
      </DashboardPage>
    </PermissionGate>
  )
}

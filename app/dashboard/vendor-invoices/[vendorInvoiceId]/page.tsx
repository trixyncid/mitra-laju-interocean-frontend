"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconArrowLeft } from "@tabler/icons-react"

import { DashboardPage } from "@/components/layout/dashboard-page"
import { Button } from "@/components/ui/button"
import { VendorInvoicePanel } from "@/components/vendor-invoices/vendor-invoice-panel"

export default function VendorInvoiceDetailPage({
  params,
}: {
  params: Promise<{ vendorInvoiceId: string }>
}) {
  const { vendorInvoiceId } = use(params)
  const router = useRouter()

  return (
    <DashboardPage>
      <div className="mb-4">
        <Button asChild variant="ghost" className="text-muted-foreground">
          <Link href={`/dashboard/vendor-invoices?invoice=${vendorInvoiceId}`}>
            <IconArrowLeft className="size-5" />
            Back to vendor invoices
          </Link>
        </Button>
      </div>
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl surface">
        <VendorInvoicePanel
          vendorInvoiceId={vendorInvoiceId}
          showOpenFullPage={false}
          onDeleted={() => router.push("/dashboard/vendor-invoices")}
        />
      </div>
    </DashboardPage>
  )
}

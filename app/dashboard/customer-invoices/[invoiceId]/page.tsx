"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconArrowLeft } from "@tabler/icons-react"

import { CustomerInvoicePanel } from "@/components/customer-invoices/customer-invoice-panel"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { Button } from "@/components/ui/button"

export default function CustomerInvoiceDetailPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = use(params)
  const router = useRouter()
  return (
    <DashboardPage>
      <div className="mb-4">
        <Button asChild variant="ghost" className="text-muted-foreground">
          <Link href={`/dashboard/customer-invoices?invoice=${invoiceId}`}>
            <IconArrowLeft className="size-5" />
            Back to invoices
          </Link>
        </Button>
      </div>
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl surface">
        <CustomerInvoicePanel
          invoiceId={invoiceId}
          showOpenFullPage={false}
          onDeleted={() => router.push("/dashboard/customer-invoices")}
        />
      </div>
    </DashboardPage>
  )
}

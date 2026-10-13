"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconArrowLeft } from "@tabler/icons-react"

import { DashboardPage } from "@/components/layout/dashboard-page"
import { SalesPanel } from "@/components/sales/sales-panel"
import { Button } from "@/components/ui/button"

export default function SalesDetailPage({ params }: { params: Promise<{ salesId: string }> }) {
  const { salesId } = use(params)
  const router = useRouter()
  return (
    <DashboardPage>
      <div className="mb-4">
        <Button asChild variant="ghost" className="text-muted-foreground">
          <Link href={`/dashboard/sales?sales=${salesId}`}>
            <IconArrowLeft className="size-5" />
            Back to sales
          </Link>
        </Button>
      </div>
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl surface">
        <SalesPanel salesId={salesId} showOpenFullPage={false} onDeleted={() => router.push("/dashboard/sales")} />
      </div>
    </DashboardPage>
  )
}

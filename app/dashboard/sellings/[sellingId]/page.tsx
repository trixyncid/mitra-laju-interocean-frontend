"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconArrowLeft } from "@tabler/icons-react"

import { DashboardPage } from "@/components/layout/dashboard-page"
import { SellingPanel } from "@/components/sellings/selling-panel"
import { Button } from "@/components/ui/button"

export default function SellingDetailPage({ params }: { params: Promise<{ sellingId: string }> }) {
  const { sellingId } = use(params)
  const router = useRouter()
  return (
    <DashboardPage>
      <div className="mb-4">
        <Button asChild variant="ghost" className="text-muted-foreground">
          <Link href={`/dashboard/sellings?selling=${sellingId}`}>
            <IconArrowLeft className="size-5" />
            Back to selling
          </Link>
        </Button>
      </div>
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl surface">
        <SellingPanel sellingId={sellingId} showOpenFullPage={false} onDeleted={() => router.push("/dashboard/sellings")} />
      </div>
    </DashboardPage>
  )
}

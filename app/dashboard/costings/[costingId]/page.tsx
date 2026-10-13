"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconArrowLeft } from "@tabler/icons-react"

import { CostingPanel } from "@/components/costings/costing-panel"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { Button } from "@/components/ui/button"

export default function CostingDetailPage({
  params,
}: {
  params: Promise<{ costingId: string }>
}) {
  const { costingId } = use(params)
  const router = useRouter()

  return (
    <DashboardPage>
      <div className="mb-4">
        <Button asChild variant="ghost" className="text-muted-foreground">
          <Link href={`/dashboard/costings?costing=${costingId}`}>
            <IconArrowLeft className="size-5" />
            Back to costing
          </Link>
        </Button>
      </div>
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl surface">
        <CostingPanel
          costingId={costingId}
          showOpenFullPage={false}
          onDeleted={() => router.push("/dashboard/costings")}
        />
      </div>
    </DashboardPage>
  )
}

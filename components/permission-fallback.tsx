"use client"

import Link from "next/link"
import { IconArrowLeft } from "@tabler/icons-react"

import {
  DashboardPage,
  DashboardPageCard,
  DashboardPageHeader,
} from "@/components/layout/dashboard-page"
import { Button } from "@/components/ui/button"

export function PermissionFallback({
  title = "You do not have permission",
  message,
  backHref,
  backLabel,
}: {
  title?: string
  message: string
  backHref: string
  backLabel: string
}) {
  return (
    <DashboardPage atmosphere>
      <DashboardPageHeader
        title={title}
        description={message}
        action={
          <Button variant="outline" asChild>
            <Link href={backHref}>
              <IconArrowLeft className="size-4" />
              {backLabel}
            </Link>
          </Button>
        }
      />
      <DashboardPageCard>
        <p className="text-sm text-muted-foreground">{message}</p>
      </DashboardPageCard>
    </DashboardPage>
  )
}

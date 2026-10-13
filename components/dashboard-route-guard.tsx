"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { IconLock } from "@tabler/icons-react"

import TableSkeleton from "@/components/loading/table-skeleton"
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { usePermissions } from "@/hooks/use-permissions"
import { getHomePathFromPermissions, getRouteModule, MODULE_LABEL } from "@/lib/permissions"

/** A page the role can't open. Named so the user knows what to ask an admin for. */
function NoAccess({ pageName, homePath }: { pageName: string; homePath: string }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DashboardPage atmosphere>
        <DashboardPageCard>
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconLock />
              </EmptyMedia>
              <EmptyTitle>You cannot open {pageName}</EmptyTitle>
              <EmptyDescription>
                Your role does not include this page. If you need it for your work, ask your
                admin to add it.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href={homePath}>Back to my home page</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </DashboardPageCard>
      </DashboardPage>
    </div>
  )
}

export function DashboardRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isPending, canAccessRoute, permissions, role } = usePermissions()

  const allowed = canAccessRoute(pathname)
  const homePath = getHomePathFromPermissions(permissions, role)
  // "/dashboard" is the generic entry point (logo, old links): send the role to
  // its own home quietly. Any other page explains why it can't be opened.
  const redirectHome = pathname === "/dashboard" && homePath !== pathname

  useEffect(() => {
    if (!isPending && !allowed && redirectHome) {
      router.replace(homePath)
    }
  }, [isPending, allowed, redirectHome, router, homePath])

  if (isPending) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <DashboardPage atmosphere>
          <DashboardPageCard>
            <TableSkeleton />
          </DashboardPageCard>
        </DashboardPage>
      </div>
    )
  }

  if (!allowed) {
    if (redirectHome) return null
    const routeModule = getRouteModule(pathname)
    const pageName =
      routeModule && routeModule !== "profile" ? MODULE_LABEL[routeModule] : "this page"
    return <NoAccess pageName={pageName} homePath={homePath} />
  }

  return <div className="flex min-h-0 flex-1 flex-col">{children}</div>
}

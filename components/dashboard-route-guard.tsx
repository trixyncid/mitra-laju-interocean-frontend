"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import TableSkeleton from "@/components/loading/table-skeleton"
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
import { usePermissions } from "@/hooks/use-permissions"
import { getRoleHomePath } from "@/lib/role-home"

export function DashboardRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isPending, canAccessRoute, rawRole, session } = usePermissions()

  const allowed = canAccessRoute(pathname)
  const fallbackPath = getRoleHomePath(session?.user ?? rawRole)

  useEffect(() => {
    if (!isPending && !allowed && pathname !== fallbackPath) {
      router.replace(fallbackPath)
    }
  }, [isPending, allowed, pathname, router, fallbackPath])

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

  if (!allowed) return null

  return <div className="flex min-h-0 flex-1 flex-col">{children}</div>
}

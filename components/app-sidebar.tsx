"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconBuildingLighthouse,
  IconBuildingWarehouse,
  IconFileDollar,
  IconLayoutDashboard,
  IconReceipt,
  IconShip,
  IconShieldCog,
  IconTruck,
  IconBox,
  IconUserCog,
  IconUsersGroup,
} from "@tabler/icons-react"

import { NavAdminPanel } from "@/components/nav-admin-panel"
import { NavMasterData } from "@/components/nav-master-data"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { NavTransactionalData } from "@/components/nav-transactional-data"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"
import { usePermissions } from "@/hooks/use-permissions"
import { FINANCIAL_MODULES_ENABLED, isFinancialModule } from "@/lib/feature-flags"
import { cn } from "@/lib/utils"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconLayoutDashboard,
      module: "DASHBOARD" as const,
    },
  ],
  masterData: [
    {
      name: "Customer",
      url: "/dashboard/customers",
      icon: IconUsersGroup,
      module: "CUSTOMER" as const,
    },
    {
      name: "Vendor",
      url: "/dashboard/vendors",
      icon: IconBuildingWarehouse,
      module: "VENDOR" as const,
    },
    {
      name: "Port",
      url: "/dashboard/ports",
      icon: IconBuildingLighthouse,
      module: "PORT" as const,
    },
    {
      name: "Vessel",
      url: "/dashboard/vessels",
      icon: IconShip,
      module: "VESSEL" as const,
    },
    {
      name: "Container",
      url: "/dashboard/containers",
      icon: IconBox,
      module: "CONTAINER" as const,
    },
  ],
  transactionalData: [
    {
      name: "Shipment",
      url: "/dashboard/shipments",
      icon: IconTruck,
      module: "SHIPMENT" as const,
    },
    {
      name: "Costing",
      url: "/dashboard/costings",
      icon: IconFileDollar,
      module: "COSTING" as const,
    },
    {
      name: "Selling",
      url: "/dashboard/sellings",
      icon: IconReceipt,
      module: "SELLING" as const,
    },
  ],
  adminPanel: [
    {
      name: "User",
      url: "/dashboard/users",
      icon: IconUserCog,
      module: "USER" as const,
    },
    {
      name: "Role",
      url: "/dashboard/roles",
      icon: IconShieldCog,
      module: "ROLE" as const,
    },
  ],
}

function SidebarAtmosphere() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#002851_0%,#001833_48%,#001228_100%)]" />
      <div className="absolute -left-16 top-0 size-56 rounded-full bg-[#325f9e]/35 blur-3xl" />
      <div className="absolute -right-20 top-40 size-64 rounded-full bg-[#91baff]/15 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/25 to-transparent" />
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </div>
  )
}

function SidebarBrand() {
  return (
    <Link
      href="/dashboard"
      className="group/brand flex items-center gap-3 rounded-lg px-2 py-2.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring"
    >
      <span
        className={cn(
          "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg",
          "bg-gradient-to-br from-[#6e9ef7] via-[#325f9e] to-[#1b365d]",
          "shadow-[0_8px_20px_rgba(50,95,158,0.45)] ring-1 ring-white/20"
        )}
      >
        <span className="relative z-10 text-[13px] font-bold tracking-[0.04em] text-white">
          ML
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-semibold tracking-[0.14em] text-[#91baff]/90 uppercase">
          Mitra Laju
        </span>
        <span className="block truncate text-[15px] font-semibold tracking-tight text-sidebar-foreground">
          Interocean
        </span>
      </span>
    </Link>
  )
}

function SidebarLoading() {
  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarAtmosphere />
      <SidebarHeader className="relative z-10 gap-3 px-3 pt-3">
        <div className="flex items-center gap-3 px-2 py-2.5">
          <Skeleton className="size-10 rounded-lg bg-white/10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-2.5 w-16 rounded-md bg-white/10" />
            <Skeleton className="h-3.5 w-24 rounded-md bg-white/10" />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="relative z-10 gap-4 px-2">
        {Array.from({ length: 3 }).map((_, group) => (
          <div key={group} className="space-y-2 px-2">
            <Skeleton className="h-2.5 w-20 rounded-md bg-white/10" />
            {Array.from({ length: 3 }).map((__, row) => (
              <Skeleton key={row} className="h-9 w-full rounded-md bg-white/10" />
            ))}
          </div>
        ))}
      </SidebarContent>
      <SidebarFooter className="relative z-10 px-3 pb-3">
        <Skeleton className="h-14 w-full rounded-lg bg-white/10" />
      </SidebarFooter>
    </Sidebar>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, error } = authClient.useSession()
  const { can, isPending } = usePermissions()
  const userId = session?.user?.id

  const mainNavItems = data.navMain.filter((item) => can(item.module, "view"))
  const masterDataItems = data.masterData
    .filter((item) => can(item.module, "view"))
    .map(({ module: _m, ...item }) => item)
  const transactionalItems = data.transactionalData
    .filter((item) => FINANCIAL_MODULES_ENABLED || !isFinancialModule(item.module))
    .filter((item) => can(item.module, "view"))
    .map(({ module: _m, ...item }) => item)
  const adminPanelItems = data.adminPanel
    .filter((item) => can(item.module, "view"))
    .map(({ module: _m, ...item }) => item)

  if (isPending) return <SidebarLoading />
  if (error) {
    return (
      <Sidebar collapsible="offcanvas" variant="inset" {...props}>
        <SidebarAtmosphere />
        <SidebarHeader className="px-4 pt-4">
          <p className="text-sm text-[#ffb4ab]">Unable to load navigation</p>
        </SidebarHeader>
      </Sidebar>
    )
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarAtmosphere />
      <SidebarHeader className="relative z-10 gap-0 px-3 pt-3">
        <SidebarBrand />
        <SidebarSeparator className="mx-2 mt-3 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </SidebarHeader>
      <SidebarContent className="relative z-10 gap-1 px-1 pt-1">
        {mainNavItems.length > 0 ? (
          <NavMain items={mainNavItems.map(({ module: _m, ...item }) => item)} />
        ) : null}
        {masterDataItems.length > 0 ? <NavMasterData items={masterDataItems} /> : null}
        {transactionalItems.length > 0 ? (
          <NavTransactionalData items={transactionalItems} />
        ) : null}
        <NavAdminPanel items={adminPanelItems} />
      </SidebarContent>
      <SidebarFooter className="relative z-10 px-3 pb-3 pt-1">
        <SidebarSeparator className="mx-0 mb-3 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <NavUser
          user={{
            id: userId ?? "",
            name: session?.user?.name ?? "",
            email: session?.user?.email ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}

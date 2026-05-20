"use client"

import * as React from "react"
import {
  IconBuildingLighthouse,
  IconBuildingWarehouse,
  IconFileDollar,
  IconInnerShadowTop,
  IconLayoutDashboard,
  IconReceipt,
  IconShip,
  IconTruck,
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { getUserRole, isAdminRole } from "@/hooks/use-require-admin"
import { canRead, getEffectiveRole } from "@/lib/permissions"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconLayoutDashboard,
    },
  ],
  masterData: [
    {
      name: "Customer",
      url: "/dashboard/customers",
      icon: IconUsersGroup,
    },
    {
      name: "Vendor",
      url: "/dashboard/vendors",
      icon: IconBuildingWarehouse,
    },
    {
      name: "Port",
      url: "/dashboard/ports",
      icon: IconBuildingLighthouse,
    },
    {
      name: "Vessel",
      url: "/dashboard/vessels",
      icon: IconShip,
    },
  ],
  transactionalData: [
    {
      name: "Shipment",
      url: "/dashboard/shipments",
      icon: IconTruck,
      resource: "shipments" as const,
    },
    {
      name: "Costing",
      url: "/dashboard/costings",
      icon: IconFileDollar,
      resource: "costings" as const,
    },
    {
      name: "Selling",
      url: "/dashboard/sellings",
      icon: IconReceipt,
      resource: "sellings" as const,
    },
  ],
  adminPanel: [
    {
      name: "User",
      url: "/dashboard/users",
      icon: IconUserCog,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending, error } = authClient.useSession()
  const role = getEffectiveRole(getUserRole(session?.user))

  const mainNavItems = canRead(role, "dashboard") ? data.navMain : []
  const masterDataItems = canRead(role, "masterData") ? data.masterData : []
  const transactionalItems = data.transactionalData.filter((item) =>
    canRead(role, item.resource)
  )
  const adminPanelItems = isAdminRole(role) ? data.adminPanel : []

  if (isPending) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Mitra Laju Interocean</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {mainNavItems.length > 0 ? <NavMain items={mainNavItems} /> : null}
        {masterDataItems.length > 0 ? <NavMasterData items={masterDataItems} /> : null}
        {transactionalItems.length > 0 ? (
          <NavTransactionalData
            items={transactionalItems.map(({ resource: _r, ...item }) => item)}
          />
        ) : null}
        <NavAdminPanel items={adminPanelItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: session?.user?.name ?? "",
            email: session?.user?.email ?? "",
            avatar: session?.user?.image ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}

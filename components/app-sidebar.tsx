"use client"

import * as React from "react"
import {
  IconBuildingLighthouse,
  IconBuildingWarehouse,
  IconFileDollar,
  IconInnerShadowTop,
  IconLayoutDashboard,
  IconShip,
  IconTruck,
  IconUsersGroup,
} from "@tabler/icons-react"

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
    },
    {
      name: "Costing",
      url: "/dashboard/costings",
      icon: IconFileDollar,
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending, error } = authClient.useSession()

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
        <NavMain items={data.navMain} />
        <NavMasterData items={data.masterData} />
        <NavTransactionalData items={data.transactionalData} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: session?.user?.name ?? "",
          email: session?.user?.email ?? "",
          avatar: session?.user?.image ?? "",
        }} />
      </SidebarFooter>
    </Sidebar>
  )
}

"use client"

import * as React from "react"
import {
  IconBuildingLighthouse,
  IconBuildingWarehouse,
  IconDashboard,
  IconFileDollar,
  IconInnerShadowTop,
  IconShip,
  IconTruck,
  IconUsersGroup,
} from "@tabler/icons-react"

import { NavMasterData } from "@/components/nav-master-data"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Shipment",
      url: "#",
      icon: IconTruck,
    },
    {
      title: "Costing",
      url: "#",
      icon: IconFileDollar,
    },
  ],
  masterData: [
    {
      name: "Customer",
      url: "#",
      icon: IconUsersGroup,
    },
    {
      name: "Vendor",
      url: "#",
      icon: IconBuildingWarehouse,
    },
    {
      name: "Port",
      url: "#",
      icon: IconBuildingLighthouse,
    },
    {
      name: "Vessel",
      url: "#",
      icon: IconShip,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavMasterData items={data.masterData} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

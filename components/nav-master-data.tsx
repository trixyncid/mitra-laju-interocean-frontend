"use client"

import { type Icon } from "@tabler/icons-react"

import { NavSidebarLink } from "@/components/nav-sidebar-link"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"

export function NavMasterData({
  items,
}: {
  items: {
    name: string
    url: string
    icon: Icon
  }[]
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Master Data</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <NavSidebarLink
            key={item.name}
            href={item.url}
            label={item.name}
            icon={item.icon}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

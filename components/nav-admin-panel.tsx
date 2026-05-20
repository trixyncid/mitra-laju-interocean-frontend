"use client"

import { type Icon } from "@tabler/icons-react"

import { NavSidebarLink } from "@/components/nav-sidebar-link"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"

export function NavAdminPanel({
  items,
}: {
  items: {
    name: string
    url: string
    icon: Icon
  }[]
}) {
  if (items.length === 0) return null

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
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

"use client"

import { type Icon } from "@tabler/icons-react"

import { NavSidebarLink } from "@/components/nav-sidebar-link"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  return (
    <SidebarGroup className="py-1">
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => (
            <NavSidebarLink
              key={item.title}
              href={item.url}
              label={item.title}
              icon={item.icon}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

"use client"

import { type Icon } from "@tabler/icons-react"

import { NavSidebarLink } from "@/components/nav-sidebar-link"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"

const sectionLabelClass =
  "mb-1.5 h-auto px-3 text-[10px] font-semibold tracking-[0.16em] text-[#91baff]/75 uppercase"

export function NavTransactionalData({
  items,
}: {
  items: {
    name: string
    url: string
    icon: Icon
  }[]
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden py-2">
      <SidebarGroupLabel className={sectionLabelClass}>
        Transactions
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1">
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

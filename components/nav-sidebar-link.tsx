"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type Icon } from "@tabler/icons-react"

import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { isSidebarNavActive } from "@/lib/nav"
import { cn } from "@/lib/utils"

export function NavSidebarLink({
  href,
  label,
  icon: Icon,
}: {
  href: string
  label: string
  icon?: Icon
}) {
  const pathname = usePathname()
  const isActive = isSidebarNavActive(pathname, href)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={label}
        className={cn(
          "relative",
          isActive &&
            "bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-sm"
        )}
      >
        <Link href={href} aria-current={isActive ? "page" : undefined}>
          {Icon ? (
            <Icon
              className={cn(isActive && "text-sidebar-primary")}
              aria-hidden
            />
          ) : null}
          <span className="flex-1 truncate">{label}</span>
          {isActive ? (
            <span
              className="size-2 shrink-0 rounded-full bg-sidebar-primary shadow-[0_0_0_2px_var(--sidebar-accent)]"
              aria-hidden
            />
          ) : null}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

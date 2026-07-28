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
          "relative h-10 gap-3 rounded-md px-3 text-[13.5px] font-medium",
          "text-sidebar-foreground/72 transition-[background-color,color,box-shadow,transform] duration-200",
          "hover:bg-white/[0.07] hover:text-sidebar-foreground",
          "active:scale-[0.98]",
          isActive &&
            "bg-white/[0.12] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-white/[0.14] hover:text-white"
        )}
      >
        <Link href={href} aria-current={isActive ? "page" : undefined}>
          {isActive ? (
            <span
              aria-hidden
              className="absolute inset-y-1.5 left-1 w-[3px] rounded-sm bg-gradient-to-b from-[#aec7f7] to-[#325f9e]"
            />
          ) : null}
          {Icon ? (
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-md transition-colors",
                isActive
                  ? "bg-[#325f9e]/45 text-[#d6e3ff] shadow-[0_0_0_1px_rgba(174,199,247,0.25)]"
                  : "bg-transparent text-sidebar-foreground/65"
              )}
            >
              <Icon className="size-4" aria-hidden />
            </span>
          ) : null}
          <span className="flex-1 truncate tracking-[-0.01em]">{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

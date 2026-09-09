"use client"

import Image from "next/image"
import { IconArrowUpRight } from "@tabler/icons-react"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center gap-2 border-b border-[rgba(214,227,255,0.35)] bg-[rgba(238,243,249,0.78)] backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 rounded-md text-[var(--mli-primary-container)] hover:bg-[rgba(214,227,255,0.45)]" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:bg-[rgba(214,227,255,0.55)]"
        />
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold tracking-[0.14em] text-[var(--mli-primary-container)]/70 uppercase">
            Operations
          </p>
          <h1 className="truncate text-sm font-semibold tracking-tight text-foreground">
            Freight Forwarding Systems
          </h1>
        </div>

        <div className="ml-auto flex items-center pl-2">
          <a
            href="https://trixync.id"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Built by Trixync — opens in a new tab"
            className={cn(
              "group/trixync inline-flex items-center gap-2 rounded-lg border border-[rgba(214,227,255,0.45)]",
              "bg-[rgba(247,249,251,0.55)] px-2 py-1.5 sm:gap-2.5 sm:px-2.5",
              "shadow-[0_1px_0_rgba(255,255,255,0.65)_inset]",
              "transition-[border-color,background-color,box-shadow,transform] duration-200",
              "hover:border-[rgba(214,227,255,0.85)] hover:bg-[rgba(247,249,251,0.92)]",
              "hover:shadow-[0_8px_20px_rgba(27,54,93,0.08)]",
              "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20",
              "active:scale-[0.98]"
            )}
          >
            <Image
              src="/brand/trixync/logo-icon.svg"
              alt=""
              width={28}
              height={25}
              className="h-5 w-auto"
              priority
            />
            <span className="flex min-w-0 flex-col font-trixync leading-none">
              <span className="hidden text-[9px] font-semibold tracking-[0.14em] text-muted-foreground uppercase sm:block">
                Built by
              </span>
              <span className="text-[13px] font-semibold tracking-tight text-[#101726]">
                Trixync
              </span>
            </span>
            <IconArrowUpRight
              className="size-3.5 shrink-0 text-muted-foreground/70 transition-transform duration-200 group-hover/trixync:-translate-y-0.5 group-hover/trixync:translate-x-0.5 group-hover/trixync:text-[#101726]"
              aria-hidden
            />
          </a>
        </div>
      </div>
    </header>
  )
}

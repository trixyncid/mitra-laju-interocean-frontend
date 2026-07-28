"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

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
        <div className="ml-auto hidden items-center gap-2 sm:flex">
          <span className="rounded-md border border-[rgba(214,227,255,0.5)] bg-[rgba(247,249,251,0.65)] px-3 py-1 text-[11px] font-medium tracking-wide text-muted-foreground">
            Twin Stack Labs
          </span>
        </div>
      </div>
    </header>
  )
}

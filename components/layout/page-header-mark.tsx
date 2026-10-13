"use client"

import { usePathname } from "next/navigation"

import { navContextFor } from "@/lib/nav"

/** Brand icon tile and "Group / Section" eyebrow for the current page. */
export function PageHeaderMark({ title }: { title: string }) {
  const pathname = usePathname()
  const context = navContextFor(pathname)
  if (!context) return null
  const Icon = context.item.icon
  const crumbs = [context.group, context.item.label !== title ? context.item.label : null].filter(Boolean)
  return (
    <div className="flex items-center gap-3">
      <span className="brand-fill flex size-9 shrink-0 items-center justify-center rounded-xl">
        <Icon className="size-[18px]" aria-hidden />
      </span>
      {crumbs.length ? (
        <p className="text-[13px] font-medium text-muted-foreground">
          {crumbs.map((crumb, index) => (
            <span key={crumb}>
              {index ? <span className="mx-1.5 text-muted-foreground/50">/</span> : null}
              {crumb}
            </span>
          ))}
        </p>
      ) : null}
    </div>
  )
}

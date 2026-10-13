"use client"

import Link from "next/link"
import type { ComponentProps } from "react"

import { usePermissions } from "@/hooks/use-permissions"
import type { AppModule } from "@/lib/permissions"
import { cn } from "@/lib/utils"

type RecordLinkProps = ComponentProps<typeof Link> & {
  /** The module that owns the target page. */
  module: AppModule
}

/**
 * A link to another module's record. Roles that can see the record inside their
 * own work but not open its page get plain text instead of a dead click.
 */
export function RecordLink({ module, href, className, children, ...props }: RecordLinkProps) {
  const { canView } = usePermissions()

  if (!canView(module)) {
    return (
      <span title={props.title} className={cn(className, "cursor-default hover:no-underline")}>
        {children}
      </span>
    )
  }

  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  )
}

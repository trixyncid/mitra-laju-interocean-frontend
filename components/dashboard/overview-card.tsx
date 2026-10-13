import Link from "next/link"
import type { ReactNode } from "react"
import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

/** White, generously rounded card used across the overview. */
export function OverviewCard({
  title,
  description,
  action,
  className,
  children,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-2xl surface p-5 sm:p-6",
        className
      )}
    >
      <header className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-medium tracking-[-0.01em] text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      {children}
    </section>
  )
}

/** Round "open" button in a card's top-right corner. */
export function OverviewCardLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/15"
    >
      <IconArrowUpRight className="size-4" />
    </Link>
  )
}

/** Percentage change between two periods; null when there is no baseline. */
export function percentChange(current: number, previous: number | undefined) {
  if (previous === undefined || !Number.isFinite(previous) || previous === 0) return null
  return ((current - previous) / previous) * 100
}

export function DeltaBadge({
  value,
  className,
}: {
  value: number | null
  className?: string
}) {
  if (value === null) {
    return <span className={cn("text-sm text-muted-foreground", className)}>—</span>
  }
  const up = value >= 0
  const Icon = up ? IconArrowUpRight : IconArrowDownRight
  const formatted = `${up ? "+" : "−"}${Math.abs(value).toLocaleString("id-ID", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Math.abs(value) < 10 ? 2 : 0,
  })}%`

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium tabular-nums",
        up ? "text-[var(--mli-positive)]" : "text-[var(--mli-negative)]",
        className
      )}
    >
      {formatted}
      <Icon className="size-4" aria-hidden />
      <span className="sr-only">{up ? "increase" : "decrease"} versus previous period</span>
    </span>
  )
}

export function formatIdr(value: string | number) {
  const amount = typeof value === "string" ? parseFloat(value) : value
  if (Number.isNaN(amount)) return "—"
  return amount.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

export function formatIdrCompact(value: string | number) {
  const amount = typeof value === "string" ? parseFloat(value) : value
  if (Number.isNaN(amount)) return "—"
  if (Math.abs(amount) < 10_000) return formatIdr(amount)
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount)
}

import { cn } from "@/lib/utils"

/** Max content width for dashboard pages and data tables (1440px). */
export const containerMaxWidth = "max-w-[var(--mli-container-max)]"

export const pageShell = "min-h-full w-full bg-background px-4 sm:px-6 lg:px-8 xl:px-10"
export const pageMain = `mx-auto min-w-0 w-full ${containerMaxWidth} py-6 lg:py-12`
export const pageHeader = "mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between lg:mb-12"
export const pageCard =
  "rounded-[3rem] border border-border bg-card p-6 shadow-ambient-hover lg:p-8"

export const tableSearchInput =
  "h-11 w-full max-w-xl cursor-text caret-primary rounded-full border-border bg-card px-5 text-base shadow-none placeholder:text-muted-foreground/80 transition-[color,background-color,border-color,box-shadow] duration-200 hover:border-input focus-visible:border-ring focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/20"

export const tableHeaderRow =
  "border-b border-border bg-muted/60 hover:bg-muted/60"
export const tableHeaderCell =
  "h-auto px-4 py-3 text-left text-sm font-medium text-muted-foreground whitespace-nowrap"
export const tableRowClass =
  "border-b border-border/50 transition-colors hover:bg-muted/30"
export const tableCellClass = "px-4 py-3 text-sm align-middle text-foreground"

export const chipBase =
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[0.05em]"

export function chipActive(className?: string) {
  return cn(
    chipBase,
    "bg-[var(--mli-success-container)] text-[var(--mli-on-success-container)]",
    className
  )
}

export function chipInactive(className?: string) {
  return cn(
    chipBase,
    "bg-[var(--mli-error-container)] text-[var(--mli-on-error-container)]",
    className
  )
}

export function chipInfo(className?: string) {
  return cn(chipBase, "bg-secondary text-secondary-foreground", className)
}

export function chipTbd(className?: string) {
  return cn(chipBase, "bg-secondary text-primary", className)
}

export function chipWarning(className?: string) {
  return cn(
    chipBase,
    "bg-[var(--mli-warning-container)] text-[var(--mli-on-warning-container)]",
    className
  )
}

export const primaryText = "font-semibold text-foreground"
export const secondaryText = "text-muted-foreground"

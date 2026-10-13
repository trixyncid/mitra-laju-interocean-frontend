import { cn } from "@/lib/utils"

/** Max content width for dashboard pages and data tables (1536px). */
export const containerMaxWidth = "max-w-[var(--mli-container-max)]"

export const pageShell = "min-h-full w-full px-4 sm:px-6 lg:px-8"
export const pageMain = `mx-auto min-w-0 w-full ${containerMaxWidth} pt-4 pb-10 lg:pt-6 lg:pb-14 page-enter`
export const pageHeader = "mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between lg:mb-8"

/**
 * Primary surface — a white card lifted off the canvas by a hairline ring and
 * a soft ink-tinted shadow. (Name kept from the earlier glass system.)
 */
export const glassPanel = "rounded-xl border border-transparent surface"

export const glassPanelInteractive = "rounded-xl border border-transparent surface surface-lift"

export const pageCard = cn(glassPanel, "p-5 lg:p-7")

/** Nested table shell inside page cards. */
export const tableShell = "overflow-x-auto rounded-lg border border-border bg-card shadow-elev-1"

export const tableSearchInput =
  "h-10 w-full max-w-xl cursor-text caret-primary rounded-full border-transparent bg-muted px-5 text-[15px] shadow-none placeholder:text-muted-foreground transition-[color,background-color,border-color,box-shadow] duration-200 hover:bg-accent focus-visible:border-input focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/10"

/** Outline controls (selects, date pickers) on card surfaces. */
export const glassControl =
  "rounded-full border-border bg-card shadow-elev-1 hover:border-input hover:bg-muted"

/** Floating menus and filter popovers. */
export const glassMenu =
  "rounded-lg border border-border bg-popover shadow-elev-3"

export const tableHeaderRow = "border-b border-border bg-muted/60 hover:bg-muted/60"
export const tableHeaderCell =
  "h-auto px-4 py-3.5 text-left text-[13px] font-medium text-muted-foreground whitespace-nowrap"
export const tableRowClass = "border-b border-border/70 transition-colors hover:bg-muted/50"
export const tableCellClass = "px-4 py-3.5 text-sm align-middle text-foreground"

/** Keeps a table's action column pinned to the right edge while the table scrolls sideways. */
const stickyActionBase =
  "sticky right-0 z-10 w-px whitespace-nowrap text-right shadow-[-6px_0_8px_-6px_rgba(var(--mli-ink-rgb),0.12)]"
export const stickyActionHeaderCell = `${stickyActionBase} bg-muted`
/** Opaque, so scrolled content hides behind it; follows the row's hover tint. */
export const stickyActionCell = `${stickyActionBase} bg-card [tr:hover>&]:bg-[color-mix(in_oklab,var(--muted)_50%,var(--card))]`

export const brandText = "text-foreground"
export const brandLink =
  "font-medium text-foreground underline-offset-4 decoration-foreground/30 hover:underline"

/** Black pill for the active segment of a pill tab group. */
export const glassTabsTrigger =
  "rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"

export const glassTabCount =
  "rounded-full bg-muted px-1.5 text-foreground"

/** Former highlight line on glass panels — no longer rendered. */
export const glassShine = "hidden"

export const glassInset = "rounded-lg surface-inset"

export const metadataCardShell = cn(glassPanel, "overflow-hidden")

export const metadataIconWell =
  "flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground"

/** Round icon "well" used for KPI icons and card action buttons. */
export const iconCircle =
  "flex size-12 shrink-0 items-center justify-center rounded-full surface text-foreground"

export const chipBase =
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"

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

export function chipExport(className?: string) {
  return cn(
    chipBase,
    "bg-[var(--mli-export-container)] text-[var(--mli-on-export-container)]",
    className
  )
}

export function chipImport(className?: string) {
  return cn(
    chipBase,
    "bg-[var(--mli-import-container)] text-[var(--mli-on-import-container)]",
    className
  )
}

export function chipDomestic(className?: string) {
  return cn(
    chipBase,
    "bg-[var(--mli-domestic-container)] text-[var(--mli-on-domestic-container)]",
    className
  )
}

export function chipDraft(className?: string) {
  return cn(
    chipBase,
    "bg-[var(--mli-draft-container)] text-[var(--mli-on-draft-container)]",
    className
  )
}

export function chipBackup(className?: string) {
  return cn(
    chipBase,
    "bg-[var(--mli-backup-container)] text-[var(--mli-on-backup-container)]",
    className
  )
}

export function chipFinished(className?: string) {
  return cn(
    chipBase,
    "bg-[var(--mli-finished-container)] text-[var(--mli-on-finished-container)]",
    className
  )
}

export function chipShipmentType(
  type: string | null | undefined,
  className?: string
) {
  const normalized = (type ?? "").toUpperCase()
  if (normalized === "EXPORT") return chipExport(className)
  if (normalized === "IMPORT") return chipImport(className)
  if (normalized === "DOMESTIC") return chipDomestic(className)
  return chipInfo(className)
}

export const primaryText = "font-semibold text-foreground"
export const secondaryText = "text-muted-foreground"

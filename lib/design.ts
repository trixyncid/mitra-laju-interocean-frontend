import { cn } from "@/lib/utils"

/** Max content width for dashboard pages and data tables (1440px). */
export const containerMaxWidth = "max-w-[var(--mli-container-max)]"

export const pageShell = "min-h-full w-full bg-background px-4 sm:px-6 lg:px-8 xl:px-10"
export const pageMain = `mx-auto min-w-0 w-full ${containerMaxWidth} py-6 lg:py-12`
export const pageHeader = "mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between lg:mb-12"

/**
 * Frosted glass surface — cool blue-tinted fill (not pure white) so panels
 * sit softly on the atmosphere gradient without chalky contrast.
 */
export const glassPanel =
  "rounded-lg border border-[rgba(214,227,255,0.55)] bg-[rgba(232,238,246,0.72)] shadow-[0_8px_32px_rgba(27,54,93,0.07)] backdrop-blur-xl"

export const glassPanelInteractive =
  "rounded-lg border border-[rgba(214,227,255,0.55)] bg-[rgba(232,238,246,0.72)] shadow-[0_8px_32px_rgba(27,54,93,0.07)] backdrop-blur-xl transition-[border-color,background-color,box-shadow] duration-200 hover:border-[rgba(214,227,255,0.8)] hover:bg-[rgba(238,243,249,0.88)] hover:shadow-[0_12px_40px_rgba(27,54,93,0.1)]"

export const pageCard = cn(
  glassPanel,
  "p-6 shadow-[0_8px_32px_rgba(27,54,93,0.07)] lg:p-8"
)

/** Nested table shell inside glass page cards. */
export const tableShell =
  "overflow-x-auto rounded-md border border-[rgba(214,227,255,0.4)] bg-[rgba(247,249,251,0.55)]"

export const tableSearchInput =
  "h-11 w-full max-w-xl cursor-text caret-primary rounded-md border-[rgba(214,227,255,0.55)] bg-[rgba(247,249,251,0.6)] px-5 text-base shadow-none placeholder:text-muted-foreground/80 transition-[color,background-color,border-color,box-shadow] duration-200 hover:border-input focus-visible:border-ring focus-visible:bg-[rgba(247,249,251,0.92)] focus-visible:ring-[3px] focus-visible:ring-ring/20"

/** Outline controls (selects, date pickers) on glass surfaces. */
export const glassControl =
  "rounded-md border-[rgba(214,227,255,0.55)] bg-[rgba(247,249,251,0.6)] shadow-none hover:border-input hover:bg-[rgba(247,249,251,0.85)]"

/** Floating menus and filter popovers on glass dashboards. */
export const glassMenu =
  "rounded-lg border border-[rgba(214,227,255,0.45)] bg-[rgba(247,249,251,0.96)] shadow-[0_16px_40px_rgba(27,54,93,0.12)] backdrop-blur-xl"

export const tableHeaderRow =
  "border-b border-[rgba(214,227,255,0.35)] bg-[rgba(232,238,246,0.55)] hover:bg-[rgba(232,238,246,0.55)]"
export const tableHeaderCell =
  "h-auto px-4 py-3 text-left text-sm font-medium text-foreground/70 whitespace-nowrap"
export const tableRowClass =
  "border-b border-[rgba(214,227,255,0.28)] transition-colors hover:bg-[rgba(247,249,251,0.65)]"
export const tableCellClass = "px-4 py-3 text-sm align-middle text-foreground"

export const brandText = "text-[var(--mli-primary-container)]"
export const brandLink =
  "font-medium text-[var(--mli-primary-container)] hover:underline"

export const glassTabsTrigger =
  "rounded-md data-[state=active]:bg-[var(--mli-primary-container)] data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"

export const glassTabCount =
  "rounded-md bg-[rgba(247,249,251,0.7)] px-1.5 text-[var(--mli-primary-container)]"

export const glassShine =
  "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.65)] to-transparent"

export const glassInset =
  "rounded-md border border-[rgba(214,227,255,0.4)] bg-[rgba(247,249,251,0.5)]"

export const metadataCardShell = cn(
  glassPanel,
  "overflow-hidden rounded-lg shadow-[0_8px_32px_rgba(27,54,93,0.07)]"
)

export const metadataIconWell =
  "flex size-9 shrink-0 items-center justify-center rounded-md bg-[rgba(214,227,255,0.45)] text-[var(--mli-primary-container)]"

export const chipBase =
  "inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold tracking-[0.05em]"

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

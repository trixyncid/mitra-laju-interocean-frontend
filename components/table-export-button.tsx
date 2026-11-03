"use client"

import { useState } from "react"
import { IconFileSpreadsheet } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/use-permissions"
import type { AppModule } from "@/lib/permissions"

/**
 * Downloads a module's table (with its current filters) as Excel. Hidden for
 * roles without the module's Export right; the server checks it again.
 */
export function TableExportButton({
  module,
  noun,
  totalRows,
  onExport,
  compact = false,
}: {
  module: AppModule
  /** Plural, lower case: "customers". */
  noun: string
  totalRows: number
  /** Runs the download; resolves with how many rows the file holds, if known. */
  onExport: () => Promise<{ rowCount: number | null }>
  /** Icon-only button for tight toolbars. */
  compact?: boolean
}) {
  const { can } = usePermissions()
  const [isExporting, setIsExporting] = useState(false)

  if (!can(module, "export")) return null

  async function handleExport() {
    if (isExporting) return
    if (totalRows === 0) {
      toast.error(`No ${noun} to export for the current filters.`)
      return
    }
    setIsExporting(true)
    try {
      const { rowCount } = await onExport()
      toast.success(`Exported ${rowCount ?? totalRows} ${noun}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to export ${noun}.`)
    } finally {
      setIsExporting(false)
    }
  }

  if (compact) {
    const label = isExporting ? "Exporting…" : `Export ${totalRows} ${noun} to Excel`
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isExporting}
        onClick={() => void handleExport()}
        aria-label={label}
        title={label}
      >
        <IconFileSpreadsheet className={isExporting ? "animate-pulse" : undefined} />
      </Button>
    )
  }

  return (
    <Button type="button" variant="outline" disabled={isExporting} onClick={() => void handleExport()}>
      <IconFileSpreadsheet className="size-4" />
      {isExporting ? "Exporting..." : totalRows > 0 ? `Export Excel (${totalRows})` : "Export Excel"}
    </Button>
  )
}

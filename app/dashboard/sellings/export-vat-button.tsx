"use client"

import { useState } from "react"
import { IconFileSpreadsheet } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { sellingService } from "@/services/selling.service"

export function ExportSellingVatButton() {
  const [isExporting, setIsExporting] = useState(false)

  async function handleExport() {
    if (isExporting) return

    setIsExporting(true)
    try {
      const { rowCount } = await sellingService.exportVatExcel()
      toast.success(
        `Exported ${rowCount ?? 0} selling VAT line${rowCount === 1 ? "" : "s"}.`
      )
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not export the selling VAT report. Please try again."
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 gap-2"
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <IconFileSpreadsheet className="size-4" />
      )}
      Export invoice VAT
    </Button>
  )
}

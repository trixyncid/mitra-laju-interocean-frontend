"use client"

import { useState } from "react"
import { IconFileSpreadsheet } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DateRangePicker,
  type TableDateRange,
} from "@/components/ui/date-range-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { metadataIconWell } from "@/lib/design"
import { costingService } from "@/services/costing.service"

export function ExportPph23Dialog() {
  const [open, setOpen] = useState(false)
  const [dateRange, setDateRange] = useState<TableDateRange>({})
  const [isExporting, setIsExporting] = useState(false)

  const canExport = Boolean(dateRange.from && dateRange.to)

  async function handleExport() {
    if (isExporting || !dateRange.from || !dateRange.to) return

    setIsExporting(true)
    try {
      const { rowCount } = await costingService.exportPph23Excel({
        invoiceDateFrom: dateRange.from,
        invoiceDateTo: dateRange.to,
      })
      toast.success(
        `Exported ${rowCount ?? 0} PPH23 item${rowCount === 1 ? "" : "s"}.`
      )
      setOpen(false)
      setDateRange({})
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not export the PPH23 report. Please try again."
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isExporting) return
        setOpen(next)
        if (!next) {
          setDateRange({})
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="h-11 gap-2">
          <IconFileSpreadsheet className="size-4" />
          Export PPH23
        </Button>
      </DialogTrigger>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-3xl"
        showCloseButton={!isExporting}
      >
        <DialogHeader className="gap-3 border-b border-[rgba(214,227,255,0.4)] px-6 py-5 sm:px-8">
          <div className="flex items-start gap-3">
            <div className={metadataIconWell} aria-hidden>
              <IconFileSpreadsheet className="size-4" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <DialogTitle>Export PPH23 report</DialogTitle>
              <DialogDescription>
                Get an Excel file of PPH23 amounts from vendor invoices in the
                dates you choose — whether they are paid or unpaid.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 sm:px-8">
          <DateRangePicker 
            label="Vendor invoice dates"
            value={dateRange}
            onChange={setDateRange}
            layout="embedded"
            showAllOption={false}
          />
        </div>

        <DialogFooter className="border-t border-[rgba(214,227,255,0.4)] bg-[rgba(232,238,246,0.45)] px-6 py-4 sm:px-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={!canExport || isExporting}
            className="min-w-36 gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Exporting…
              </>
            ) : (
              <>
                <IconFileSpreadsheet className="size-4" />
                Export Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

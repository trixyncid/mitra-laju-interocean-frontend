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
import { ExportSheetList } from "./export-sheet-list"
import { vendorInvoiceService } from "@/services/vendor-invoice.service"

export function ExportPph23Dialog() {
  const [open, setOpen] = useState(false)
  const [dateRange, setDateRange] = useState<TableDateRange>({})
  const [isExporting, setIsExporting] = useState(false)

  const canExport = Boolean(dateRange.from && dateRange.to)

  async function handleExport() {
    if (isExporting || !dateRange.from || !dateRange.to) return

    setIsExporting(true)
    try {
      const { rowCount } = await vendorInvoiceService.exportPph23Excel({
        invoiceDateFrom: dateRange.from,
        invoiceDateTo: dateRange.to,
      })
      toast.success(
        `Report downloaded: ${rowCount ?? 0} PPh 23 line${rowCount === 1 ? "" : "s"}.`
      )
      setOpen(false)
      setDateRange({})
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not export the PPh 23 report. Please try again."
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
        <Button type="button" variant="outline" className="gap-2">
          <IconFileSpreadsheet className="size-4" />
          PPh 23 report
        </Button>
      </DialogTrigger>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-3xl"
        showCloseButton={!isExporting}
      >
        <DialogHeader className="gap-3 border-b border-[rgba(var(--mli-tint-rgb),0.4)] px-6 py-5 sm:px-8">
          <div className="flex items-start gap-3">
            <div className={metadataIconWell} aria-hidden>
              <IconFileSpreadsheet className="size-4" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <DialogTitle>PPh 23 report</DialogTitle>
              <DialogDescription>
                An Excel report of the PPh 23 we withhold from vendors, for
                invoices dated between the dates you choose (paid or not).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5 sm:px-8">
          <DateRangePicker
            label="Vendor invoice dates"
            value={dateRange}
            onChange={setDateRange}
            layout="embedded"
            showAllOption={false}
          />

          <ExportSheetList
            sheets={[
              { name: "Summary", detail: "PPh 23 total, paid vs not paid, by vendor, by month and by rate" },
              { name: "Bukti Potong", detail: "one row per month, vendor and rate — to fill in e-Bupot" },
              { name: "Lines", detail: "every line with NPWP, DPP and PPh 23 — ready for a PivotTable" },
            ]}
          />
          <p className="text-xs text-muted-foreground">
            Vendors without an NPWP are marked in red, because their PPh 23 rate may be higher.
          </p>
        </div>

        <DialogFooter className="border-t border-[rgba(var(--mli-tint-rgb),0.4)] bg-[rgba(var(--mli-panel-rgb),0.45)] px-6 py-4 sm:px-8">
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

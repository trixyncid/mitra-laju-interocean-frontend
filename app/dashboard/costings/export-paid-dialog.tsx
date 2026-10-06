"use client"

import { useMemo, useState } from "react"
import { IconFileSpreadsheet } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { SearchableCombobox } from "@/components/searchable-combobox"
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
import { useVendorSearch } from "@/hooks/use-entity-searches"
import { metadataIconWell } from "@/lib/design"
import { costingService } from "@/services/costing.service"

const ALL_VENDORS = "-"

export function ExportPaidDialog() {
  const [open, setOpen] = useState(false)
  const [dateRange, setDateRange] = useState<TableDateRange>({})
  const [vendorId, setVendorId] = useState(ALL_VENDORS)
  const [vendorSearch, setVendorSearch] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  const canExport = Boolean(dateRange.from && dateRange.to)

  const { data, isLoading, isFetching } = useVendorSearch(
    vendorSearch,
    open,
    "true"
  )

  const vendorItems = useMemo(() => {
    const vendors = (data?.items ?? [])
      .filter((vendor): vendor is typeof vendor & { id: string } =>
        Boolean(vendor.id)
      )
      .map((vendor) => ({
        value: vendor.id,
        label: vendor.vendorName,
      }))

    return [{ value: ALL_VENDORS, label: "All vendors" }, ...vendors]
  }, [data?.items])

  function resetForm() {
    setDateRange({})
    setVendorId(ALL_VENDORS)
    setVendorSearch("")
  }

  async function handleExport() {
    if (isExporting || !dateRange.from || !dateRange.to) return

    setIsExporting(true)
    try {
      const { rowCount } = await costingService.exportPaidExcel({
        paymentDateFrom: dateRange.from,
        paymentDateTo: dateRange.to,
        vendorId: vendorId === ALL_VENDORS ? undefined : vendorId,
      })
      toast.success(
        `Exported ${rowCount ?? 0} paid invoice item${rowCount === 1 ? "" : "s"}.`
      )
      setOpen(false)
      resetForm()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not export the paid invoices report. Please try again."
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
          resetForm()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="h-11 gap-2">
          <IconFileSpreadsheet className="size-4" />
          Paid invoice report
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
              <DialogTitle>Paid invoice report</DialogTitle>
              <DialogDescription>
                Get an Excel file of paid vendor invoice lines for the payment
                dates you choose. Leave vendor empty to include every company,
                sorted by vendor.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5 sm:px-8">
          <SearchableCombobox
            label="Vendor"
            items={vendorItems}
            value={vendorId}
            onValueChange={setVendorId}
            onSearchTermChange={setVendorSearch}
            placeholder="All vendors"
            emptyMessage="No vendors found"
            isLoading={isLoading}
            isSearching={isFetching}
            description="Optional. Choose one vendor, or keep All vendors."
          />

          <DateRangePicker
            label="Payment dates"
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

"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { IconLink, IconPlus } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  isInvoicableBreakdown,
  type InvoicableBreakdown,
} from "@/components/forms/create-selling-invoice-form"
import { metadataIconWell } from "@/lib/design"
import { cn, costingSellingLineNet } from "@/lib/utils"
import { useAddSellingLines } from "@/hooks/use-sellings"

function formatIdr(value: number) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

export default function LinkSellingLinesForm({
  sellingId,
  orderNumber,
  breakdowns,
  trigger,
}: {
  sellingId: string
  orderNumber: string
  breakdowns: InvoicableBreakdown[]
  trigger?: ReactNode
}) {
  const addLines = useAddSellingLines()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  const available = useMemo(
    () => breakdowns.filter(isInvoicableBreakdown),
    [breakdowns]
  )

  useEffect(() => {
    if (!open) return
    const nextSelected: Record<string, boolean> = {}
    for (const line of available) {
      nextSelected[line.id] = false
    }
    setSelected(nextSelected)
  }, [open, available])

  const selectedIds = available
    .filter((line) => selected[line.id])
    .map((line) => line.id)

  function setDialogOpen(next: boolean) {
    if (addLines.isPending) return
    setOpen(next)
  }

  function handleSubmit() {
    if (selectedIds.length === 0 || addLines.isPending) return
    addLines.mutate(
      {
        id: sellingId,
        payload: {
          lines: selectedIds.map((id) => ({ costingBreakdownId: id })),
        },
      },
      {
        onSuccess: () => setDialogOpen(false),
        onError: (error: Error) => toast.error(error.message),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" size="sm" className="gap-2">
            <IconPlus className="size-4" />
            Link lines
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-3xl"
        showCloseButton={!addLines.isPending}
      >
        <DialogHeader className="gap-3 border-b border-[rgba(214,227,255,0.4)] px-6 py-5 sm:px-8">
          <div className="flex items-start gap-3">
            <div className={metadataIconWell} aria-hidden>
              <IconLink className="size-4" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <DialogTitle>Link shipment lines</DialogTitle>
              <DialogDescription>
                Choose uninvoiced costing lines from {orderNumber} to add to
                this draft invoice.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto px-6 py-5 sm:px-8">
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No uninvoiced costing lines with selling amounts are available on
              this shipment. Set a selling amount on linked lines first.
            </p>
          ) : (
            available.map((line) => {
              const checked = Boolean(selected[line.id])
              const net = costingSellingLineNet(line)
              return (
                <div
                  key={line.id}
                  className={cn(
                    "rounded-lg border border-[rgba(214,227,255,0.55)] p-4",
                    checked && "bg-[rgba(232,238,246,0.45)]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) =>
                        setSelected((prev) => ({
                          ...prev,
                          [line.id]: value === true,
                        }))
                      }
                      aria-label={`Select ${line.productDescription ?? "line"}`}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 space-y-1">
                          <p className="text-sm font-medium">
                            {line.productDescription ?? "Line item"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {line.costing?.costingNumber ?? "—"} ·{" "}
                            {line.costing?.vendor?.vendorName ?? "—"}
                          </p>
                        </div>
                        <p className="text-sm font-medium">{formatIdr(net)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <DialogFooter className="border-t border-[rgba(214,227,255,0.4)] bg-[rgba(232,238,246,0.45)] px-6 py-4 sm:px-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDialogOpen(false)}
            disabled={addLines.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={selectedIds.length === 0 || addLines.isPending}
            className="min-w-36 gap-2"
          >
            {addLines.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Linking…
              </>
            ) : (
              <>
                <IconLink className="size-4" />
                Link lines
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

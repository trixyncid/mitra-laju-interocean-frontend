"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { IconFileInvoice, IconPlus } from "@tabler/icons-react"
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
import { TextField } from "@/components/ui/text-field"
import { metadataIconWell } from "@/lib/design"
import { cn, costingSellingLineNet } from "@/lib/utils"
import { useCreateSelling } from "@/hooks/use-sellings"

export type InvoicableBreakdown = {
  id: string
  productDescription?: string | null
  sellingAmount?: number | string | null
  sellingVatPercentage?: number | string | null
  sellingPph23Percentage?: number | string | null
  sellingId?: string | null
  costing?: {
    costingNumber?: string
    vendor?: { vendorName?: string } | null
  } | null
}

function formatIdr(value: number) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

export function isInvoicableBreakdown(line: InvoicableBreakdown) {
  if (line.sellingId) return false
  return (Number(line.sellingAmount) || 0) > 0
}

export default function CreateSellingInvoiceForm({
  shipmentId,
  orderNumber,
  breakdowns,
  trigger,
  open: controlledOpen,
  onOpenChange,
  preselectedIds,
}: {
  shipmentId: string
  orderNumber: string
  breakdowns: InvoicableBreakdown[]
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** When opening, these lines start selected (and shown for remarks). */
  preselectedIds?: string[]
}) {
  const router = useRouter()
  const createSelling = useCreateSelling()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = controlledOpen ?? uncontrolledOpen

  const available = useMemo(
    () => breakdowns.filter(isInvoicableBreakdown),
    [breakdowns]
  )

  const linesForDialog = useMemo(() => {
    if (!preselectedIds?.length) return available
    const selectedSet = new Set(preselectedIds)
    const preselected = available.filter((line) => selectedSet.has(line.id))
    return preselected.length > 0 ? preselected : available
  }, [available, preselectedIds])

  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [remarks, setRemarks] = useState("")

  function resetForm() {
    setSelected({})
    setRemarks("")
  }

  function setOpen(next: boolean) {
    if (createSelling.isPending) return
    if (controlledOpen === undefined) {
      setUncontrolledOpen(next)
    }
    onOpenChange?.(next)
    if (!next) {
      resetForm()
    }
  }

  useEffect(() => {
    if (!open) return
    const nextSelected: Record<string, boolean> = {}
    const preselected = new Set(preselectedIds ?? [])
    const forcePreselect = preselected.size > 0
    for (const line of linesForDialog) {
      nextSelected[line.id] = forcePreselect ? preselected.has(line.id) : false
    }
    setSelected(nextSelected)
    setRemarks("")
  }, [open, linesForDialog, preselectedIds])

  const selectedIds = linesForDialog
    .filter((line) => selected[line.id])
    .map((line) => line.id)

  const canSubmit = selectedIds.length > 0 && remarks.trim().length > 0

  function handleSubmit() {
    if (!canSubmit || createSelling.isPending) return

    const now = new Date()
    createSelling.mutate(
      {
        shipmentId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        remarks: remarks.trim(),
        lines: selectedIds.map((id) => ({
          costingBreakdownId: id,
        })),
      },
      {
        onSuccess: (created) => {
          setOpen(false)
          const id =
            created &&
            typeof created === "object" &&
            "id" in created &&
            typeof (created as { id: unknown }).id === "string"
              ? (created as { id: string }).id
              : null
          if (id) {
            router.push(`/dashboard/sellings/${id}`)
          }
        },
        onError: (error: Error) => toast.error(error.message),
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
      }}
    >
      {controlledOpen === undefined ? (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button type="button" className="h-11 gap-2">
              <IconPlus className="size-4" />
              Create invoice
            </Button>
          )}
        </DialogTrigger>
      ) : null}
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-3xl"
        showCloseButton={!createSelling.isPending}
      >
        <DialogHeader className="gap-3 border-b border-[rgba(214,227,255,0.4)] px-6 py-5 sm:px-8">
          <div className="flex items-start gap-3">
            <div className={metadataIconWell} aria-hidden>
              <IconFileInvoice className="size-4" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <DialogTitle>Create customer invoice</DialogTitle>
              <DialogDescription>
                Choose costing lines from {orderNumber}, then add one customer
                remark so vendors stay hidden.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto px-6 py-5 sm:px-8">
          <TextField
            id="invoice-remarks"
            label="Customer remark"
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            placeholder="What the customer should see for this invoice"
            required
          />
          {linesForDialog.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No uninvoiced costing lines with selling amounts are available on
              this shipment. Set a selling amount on linked lines first.
            </p>
          ) : (
            linesForDialog.map((line) => {
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
                    <div className="min-w-0 flex-1 space-y-3">
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
            onClick={() => setOpen(false)}
            disabled={createSelling.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || createSelling.isPending}
            className="min-w-36 gap-2"
          >
            {createSelling.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <IconFileInvoice className="size-4" />
                Create draft
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

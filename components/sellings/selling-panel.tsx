"use client"

import { useState } from "react"
import Link from "next/link"
import { IconArrowUpRight, IconCalculator, IconLinkOff, IconPencil, IconPlus, IconTag, IconTrash, IconX } from "@tabler/icons-react"

import { RecordLink } from "@/components/record-link"
import { formatIdr } from "@/components/dashboard/overview-card"
import { CostingMultiPicker } from "@/components/sellings/costing-multi-picker"
import { SellingFormDialog } from "@/components/sellings/selling-form-dialog"
import {
  formatPercent,
  linkedCostingLabel,
  MARGIN_LABEL,
  MARGIN_TONE,
  sellingMargin,
} from "@/components/sellings/selling-margin"
import { Button } from "@/components/ui/button"
import { DeleteConfirmButton } from "@/components/ui/delete-confirm-button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { PermissionGate } from "@/components/permission-gate"
import { useDeleteSellingLine, useLinkSellingCostings, useSellingLine, useUnlinkSellingCosting } from "@/hooks/use-selling-lines"
import type { Costing } from "@/lib/types/costing"
import type { Selling } from "@/lib/types/selling"
import {
  cn,
  localDate,
  vendorInvoiceInvoiceLineNet,
  vendorInvoiceLineGross,
  vendorInvoiceLinePph23Amount,
  vendorInvoiceLineVatAmount,
} from "@/lib/utils"

function SellingWriteGate({ children }: { children: React.ReactNode }) {
  return (
    <PermissionGate resource="sellings" write>
      {children}
    </PermissionGate>
  )
}

function amount(value: number | string, digits = 2) {
  return Number(value).toLocaleString("id-ID", { maximumFractionDigits: digits })
}

function LinkCostingsDialog({ selling }: { selling: Selling }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Costing[]>([])
  const link = useLinkSellingCostings(selling.id)
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (link.isPending) return
        setOpen(next)
        if (next) setSelected([])
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <IconPlus className="size-4" />
          Link costings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Link costings</DialogTitle>
          <DialogDescription>
            Pick the costs “{selling.sellingDescription}” recovers. Only costings not linked to another selling are shown.
          </DialogDescription>
        </DialogHeader>
        <CostingMultiPicker selected={selected} onChange={setSelected} enabled={open} salesId={selling.salesId} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={link.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={selected.length === 0 || link.isPending}
            onClick={() => link.mutate(selected.map((costing) => costing.id), { onSuccess: () => setOpen(false) })}
          >
            {link.isPending ? "Linking…" : `Link ${selected.length || ""} costing${selected.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteSellingButton({ selling, onDeleted }: { selling: Selling; onDeleted?: () => void }) {
  const [open, setOpen] = useState(false)
  const remove = useDeleteSellingLine()
  return (
    <Dialog open={open} onOpenChange={(next) => !remove.isPending && setOpen(next)}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Delete selling line" title="Delete selling line">
          <IconTrash className="text-[var(--mli-on-error-container)]" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete selling line?</DialogTitle>
          <DialogDescription>
            “{selling.sellingDescription}” will be removed.
            {selling.costings.length > 0
              ? ` Its ${selling.costings.length} linked costing${selling.costings.length === 1 ? "" : "s"} will be released.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={remove.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <DeleteConfirmButton
            isPending={remove.isPending}
            onClick={() => remove.mutate(selling.id, { onSuccess: () => { setOpen(false); onDeleted?.() } })}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SellingPanel({
  sellingId,
  onClose,
  onDeleted,
  showOpenFullPage = true,
  className,
}: {
  sellingId: string
  onClose?: () => void
  onDeleted?: () => void
  showOpenFullPage?: boolean
  className?: string
}) {
  const { data: selling, isLoading, error } = useSellingLine(sellingId)
  const unlink = useUnlinkSellingCosting(sellingId)

  if (isLoading) {
    return (
      <div className={cn("space-y-5 p-6", className)}>
        <Skeleton className="h-12 w-2/3 rounded-full" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }
  if (error || !selling) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3 p-10 text-center", className)}>
        <p className="text-sm text-muted-foreground">{error?.message ?? "This selling line could not be loaded."}</p>
        {onClose ? <Button variant="outline" onClick={onClose}>Close</Button> : null}
      </div>
    )
  }

  const { revenue, cost, margin, percent, state } = sellingMargin(selling, selling.costings)
  const rate = Number(selling.currencyPrice)
  const costShare = revenue > 0 ? Math.min(100, (cost / revenue) * 100) : cost > 0 ? 100 : 0

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <header className="border-b border-border p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl brand-fill">
              <IconTag className="size-6" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold leading-snug tracking-[-0.02em] text-foreground sm:text-xl">
                {selling.sellingDescription}
              </h2>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {showOpenFullPage ? (
              <Button asChild variant="ghost" size="icon" aria-label="Open full page" title="Open full page">
                <Link href={`/dashboard/sellings/${selling.id}`}>
                  <IconArrowUpRight />
                </Link>
              </Button>
            ) : null}
            <SellingWriteGate>
              <DeleteSellingButton selling={selling} onDeleted={onDeleted} />
            </SellingWriteGate>
            {onClose ? (
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close details">
                <IconX />
              </Button>
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-3 py-1 text-xs font-medium", MARGIN_TONE[state])}>
            {state === "uncosted" ? MARGIN_LABEL.uncosted : `${MARGIN_LABEL[state]} · ${formatPercent(percent)}`}
          </span>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            {selling.sales ? selling.sales.salesNumber : "No sales job"}
          </span>
          <SellingWriteGate>
            <SellingFormDialog
              mode="edit"
              selling={selling}
              trigger={
                <Button variant="outline" size="sm">
                  <IconPencil className="size-4" />
                  Edit line
                </Button>
              }
            />
          </SellingWriteGate>
          {selling.updatedBy?.name ? (
            <p className="ml-auto text-xs text-muted-foreground">
              Updated {localDate(selling.updatedAt)} by {selling.updatedBy.name}
            </p>
          ) : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
        <section aria-label="Charge">
          <p className="mb-2 text-sm text-muted-foreground">
            <span className="tabular-nums text-foreground">{amount(selling.quantity, 0)}</span> ×{" "}
            <span className="tabular-nums text-foreground">{amount(selling.price)}</span>
            {rate !== 1 ? (
              <>
                {" "}× <span className="tabular-nums text-foreground">{amount(rate)}</span> rate
              </>
            ) : null}
            {Number(selling.vatPercentage) ? ` · VAT ${amount(selling.vatPercentage)}%` : ""}
            {Number(selling.pph23Percentage) ? ` · PPH 23 ${amount(selling.pph23Percentage)}%` : ""}
          </p>
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border sm:grid-cols-4">
            {[
              { label: "Revenue", value: vendorInvoiceLineGross(selling), sign: "" },
              { label: "VAT", value: vendorInvoiceLineVatAmount(selling), sign: "+ " },
              { label: "PPH 23", value: vendorInvoiceLinePph23Amount(selling), sign: "− " },
            ].map((item) => (
              <div key={item.label} className="border-b border-r border-border p-3.5 sm:border-b-0">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-[15px] font-medium tabular-nums text-foreground">
                  {item.sign}
                  {formatIdr(item.value)}
                </p>
              </div>
            ))}
            <div className="bg-primary p-3.5 text-primary-foreground">
              <p className="text-xs opacity-80">Net to invoice</p>
              <p className="mt-1 text-[17px] font-semibold tabular-nums">{formatIdr(vendorInvoiceInvoiceLineNet(selling))}</p>
            </div>
          </div>
        </section>

        <section aria-label="Margin" className="rounded-xl border border-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium text-foreground">Costs & margin</h3>
              <p className="text-xs text-muted-foreground">Before tax: revenue minus the linked costings</p>
            </div>
            <SellingWriteGate>
              <LinkCostingsDialog selling={selling} />
            </SellingWriteGate>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="font-medium tabular-nums">{formatIdr(revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cost</p>
              <p className="font-medium tabular-nums">{selling.costings.length ? formatIdr(cost) : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Margin</p>
              <p
                className={cn(
                  "font-medium tabular-nums",
                  state === "loss" && "text-[var(--mli-negative)]",
                  state === "healthy" && "text-[var(--mli-positive)]"
                )}
              >
                {state === "uncosted" ? "—" : `${formatIdr(margin)} (${formatPercent(percent)})`}
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--mli-success-container)]" role="img" aria-label={`Cost is ${Math.round(costShare)}% of revenue`}>
            <div
              className={cn("h-full rounded-full", state === "loss" ? "bg-[var(--mli-negative)]" : "bg-primary")}
              style={{ width: `${costShare}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Bar: cost as a share of revenue; the green remainder is margin.</p>

          {selling.costings.length === 0 ? (
            <p className="mt-4 rounded-lg bg-muted/70 px-3 py-4 text-center text-sm text-muted-foreground">
              No costings linked. Linking is optional — add the costs this charge recovers to track its margin.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {selling.costings.map((costing) => (
                <li key={costing.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <IconCalculator className="size-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <RecordLink module="COSTING"
                      href={`/dashboard/costings?costing=${costing.id}`}
                      className="block truncate text-sm font-medium text-foreground hover:underline"
                    >
                      {linkedCostingLabel(costing)}
                    </RecordLink>
                    <p className="truncate text-xs text-muted-foreground">
                      {costing.vendor.vendorName}
                      {costing.costingSource === "VENDOR_INVOICE" ? " · from vendor invoice" : " · manual"}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums">{formatIdr(vendorInvoiceLineGross(costing))}</span>
                  <SellingWriteGate>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Unlink ${linkedCostingLabel(costing)}`}
                      title="Unlink"
                      disabled={unlink.isPending}
                      onClick={() => unlink.mutate(costing.id)}
                    >
                      <IconLinkOff className="size-4" />
                    </Button>
                  </SellingWriteGate>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

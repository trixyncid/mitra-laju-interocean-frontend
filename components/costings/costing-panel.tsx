"use client"

import { useState } from "react"
import Link from "next/link"
import {
  IconArrowUpRight,
  IconBuildingStore,
  IconCalculator,
  IconFileInvoice,
  IconLinkOff,
  IconPencil,
  IconPlus,
  IconReceipt,
  IconTag,
  IconTrash,
  IconX,
} from "@tabler/icons-react"

import { RecordLink } from "@/components/record-link"
import { CostingFormDialog } from "@/components/costings/costing-form-dialog"
import {
  RECONCILIATION_LABEL,
  RECONCILIATION_TONE,
  reconcile,
} from "@/components/costings/costing-reconciliation"
import { formatIdr } from "@/components/dashboard/overview-card"
import { UnassignedLinesPicker } from "@/components/forms/unassigned-lines-picker"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { CostingWriteGate } from "@/components/write-gates"
import {
  useCostingById,
  useDeleteCosting,
  useMatchCostingLines,
  useUnmatchCostingLine,
} from "@/hooks/use-costings"
import { usePermissions } from "@/hooks/use-permissions"
import { costingLabel, type Costing } from "@/lib/types/costing"
import {
  cn,
  localDate,
  vendorInvoiceInvoiceLineNet,
  vendorInvoiceLineGross,
  vendorInvoiceLinePph23Amount,
  vendorInvoiceLineVatAmount,
} from "@/lib/utils"

function amount(value: number | string, digits = 2) {
  return Number(value).toLocaleString("id-ID", { maximumFractionDigits: digits })
}

function MatchLinesDialog({ costing }: { costing: Costing }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [sameVendorOnly, setSameVendorOnly] = useState(true)
  const match = useMatchCostingLines(costing.id)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (match.isPending) return
        setOpen(next)
        if (next) setSelected([])
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <IconPlus className="size-4" />
          Match vendor invoice lines
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Match vendor invoice lines</DialogTitle>
          <DialogDescription>
            Pick the lines the vendor actually billed for “{costingLabel(costing)}”. Only lines not matched to another
            costing are shown.
          </DialogDescription>
        </DialogHeader>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox checked={sameVendorOnly} onCheckedChange={(value) => setSameVendorOnly(value === true)} />
          Only show lines from {costing.vendor.vendorName}
        </label>
        <UnassignedLinesPicker
          selectedIds={selected}
          onSelectedIdsChange={setSelected}
          enabled={open}
          vendorId={sameVendorOnly ? costing.vendorId : undefined}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={match.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={selected.length === 0 || match.isPending}
            onClick={() => match.mutate(selected, { onSuccess: () => setOpen(false) })}
          >
            {match.isPending ? "Matching…" : `Match ${selected.length || ""} line${selected.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteCostingButton({ costing, onDeleted }: { costing: Costing; onDeleted?: () => void }) {
  const [open, setOpen] = useState(false)
  const deleteCosting = useDeleteCosting()
  const matched = costing.vendorInvoiceBreakdowns.length
  return (
    <Dialog open={open} onOpenChange={(next) => !deleteCosting.isPending && setOpen(next)}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Delete costing line" title="Delete costing line">
          <IconTrash className="text-[var(--mli-on-error-container)]" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete costing line?</DialogTitle>
          <DialogDescription>
            “{costingLabel(costing)}” will be removed.
            {matched > 0
              ? ` Its ${matched} matched vendor invoice line${matched === 1 ? "" : "s"} will be released and can be matched again.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={deleteCosting.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <DeleteConfirmButton
            isPending={deleteCosting.isPending}
            onClick={() =>
              deleteCosting.mutate(costing.id, {
                onSuccess: () => {
                  setOpen(false)
                  onDeleted?.()
                },
              })
            }
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PanelSkeleton() {
  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-56 rounded-full" />
          <Skeleton className="h-4 w-32 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  )
}

export function CostingPanel({
  costingId,
  onClose,
  onDeleted,
  showOpenFullPage = true,
  className,
}: {
  costingId: string
  onClose?: () => void
  onDeleted?: () => void
  showOpenFullPage?: boolean
  className?: string
}) {
  const { data: costing, isLoading, error } = useCostingById(costingId)
  const unmatch = useUnmatchCostingLine(costingId)
  const { canView } = usePermissions()

  if (isLoading) return <div className={className}><PanelSkeleton /></div>
  if (error || !costing) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3 p-10 text-center", className)}>
        <p className="text-sm text-muted-foreground">{error?.message ?? "This costing line could not be loaded."}</p>
        {onClose ? <Button variant="outline" onClick={onClose}>Close</Button> : null}
      </div>
    )
  }

  const { expected, billed, variance, state } = reconcile(costing)
  const followsInvoice = costing.costingSource === "VENDOR_INVOICE"
  const progress = expected > 0 ? Math.min(100, (billed / expected) * 100) : billed > 0 ? 100 : 0
  const rate = Number(costing.currencyPrice)

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <header className="border-b border-border p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl brand-fill">
              <IconCalculator className="size-6" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold leading-snug tracking-[-0.02em] text-foreground sm:text-xl">
                {costingLabel(costing)}
              </h2>
              <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                <IconBuildingStore className="size-4 shrink-0" />
                {canView("VENDOR") ? (
                  <Link href={`/dashboard/vendors/${costing.vendor.id}`} className="truncate hover:text-foreground hover:underline">
                    {costing.vendor.vendorName}
                    {costing.vendor.vendorCode ? ` (${costing.vendor.vendorCode})` : ""}
                  </Link>
                ) : (
                  <span className="truncate">{costing.vendor.vendorName}</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {showOpenFullPage ? (
              <Button asChild variant="ghost" size="icon" aria-label="Open full page" title="Open full page">
                <Link href={`/dashboard/costings/${costing.id}`}>
                  <IconArrowUpRight />
                </Link>
              </Button>
            ) : null}
            <CostingWriteGate>
              <DeleteCostingButton costing={costing} onDeleted={onDeleted} />
            </CostingWriteGate>
            {onClose ? (
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close details">
                <IconX />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground/80">
            {followsInvoice ? <IconFileInvoice className="size-3.5" /> : <IconPencil className="size-3.5" />}
            {followsInvoice ? "From vendor invoice" : "Manual input"}
          </span>
          <span className={cn("rounded-full px-3 py-1 text-xs font-medium", RECONCILIATION_TONE[state])}>
            {RECONCILIATION_LABEL[state]}
          </span>
          {costing.selling?.isActive ? (
            <RecordLink module="SELLING"
              href={`/dashboard/sellings?selling=${costing.selling.id}`}
              title="The selling line this cost is recovered through"
              className="inline-flex max-w-[16rem] items-center gap-1 truncate rounded-full bg-[var(--mli-success-container)] px-3 py-1 text-xs font-medium text-[var(--mli-on-success-container)] hover:underline"
            >
              <IconTag className="size-3.5 shrink-0" />
              <span className="truncate">Sold as · {costing.selling.sellingDescription}</span>
            </RecordLink>
          ) : null}
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            {costing.sales
              ? `${costing.sales.salesNumber}${costing.sales.customer ? ` · ${costing.sales.customer.customerName}` : ""}`
              : "No sales job"}
          </span>
          <CostingWriteGate>
            <CostingFormDialog
              mode="edit"
              costing={costing}
              trigger={
                <Button variant="outline" size="sm">
                  <IconPencil className="size-4" />
                  Edit line
                </Button>
              }
            />
          </CostingWriteGate>
          {costing.updatedBy?.name ? (
            <p className="ml-auto text-xs text-muted-foreground">
              Updated {localDate(costing.updatedAt)} by {costing.updatedBy.name}
            </p>
          ) : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
        <section aria-label="Expected cost">
          <p className="mb-2 text-sm text-muted-foreground">
            <span className="tabular-nums text-foreground">{amount(costing.quantity, 0)}</span> ×{" "}
            <span className="tabular-nums text-foreground">{amount(costing.price)}</span>
            {rate !== 1 ? (
              <>
                {" "}× <span className="tabular-nums text-foreground">{amount(rate)}</span> rate
              </>
            ) : null}
            {Number(costing.vatPercentage) ? ` · VAT ${amount(costing.vatPercentage)}%` : ""}
            {Number(costing.pph23Percentage) ? ` · PPH 23 ${amount(costing.pph23Percentage)}%` : ""}
          </p>
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border sm:grid-cols-4">
            {[
              { label: "Gross", value: vendorInvoiceLineGross(costing), sign: "" },
              { label: "VAT", value: vendorInvoiceLineVatAmount(costing), sign: "+ " },
              { label: "PPH 23", value: vendorInvoiceLinePph23Amount(costing), sign: "− " },
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
              <p className="text-xs opacity-80">Expected net cost</p>
              <p className="mt-1 text-[17px] font-semibold tabular-nums">{formatIdr(expected)}</p>
            </div>
          </div>
        </section>

        <section aria-label="Billed by vendor" className="rounded-xl border border-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                {followsInvoice ? "Vendor invoice line" : "Billed by vendor"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {followsInvoice
                  ? "This cost is taken from the line below; its amounts follow the line automatically."
                  : "Vendor invoice lines matched against this cost"}
              </p>
            </div>
            {followsInvoice ? null : (
              <CostingWriteGate>
                <MatchLinesDialog costing={costing} />
              </CostingWriteGate>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Expected</p>
              <p className="font-medium tabular-nums">{formatIdr(expected)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Billed</p>
              <p className="font-medium tabular-nums">{formatIdr(billed)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Variance</p>
              <p
                className={cn(
                  "font-medium tabular-nums",
                  state === "over" && "text-[var(--mli-negative)]",
                  state === "matched" && "text-[var(--mli-positive)]"
                )}
              >
                {state === "unbilled" ? "—" : `${variance > 0 ? "+ " : variance < 0 ? "− " : ""}${formatIdr(Math.abs(variance))}`}
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${Math.round(progress)}% billed`}>
            <div
              className={cn(
                "h-full rounded-full transition-[width]",
                state === "over" ? "bg-[var(--mli-negative)]" : state === "matched" ? "bg-[var(--mli-positive)]" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          {costing.vendorInvoiceBreakdowns.length === 0 ? (
            <p className="mt-4 rounded-lg bg-muted/70 px-3 py-4 text-center text-sm text-muted-foreground">
              No vendor invoice lines matched yet. When the vendor&apos;s invoice arrives, match its lines here to compare.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {costing.vendorInvoiceBreakdowns.map((line) => (
                <li key={line.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <IconReceipt className="size-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{line.productDescription}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      <RecordLink module="VENDOR_INVOICE"
                        href={`/dashboard/vendor-invoices?invoice=${line.vendorInvoice.id}`}
                        className="font-mono hover:text-foreground hover:underline"
                      >
                        {line.vendorInvoice.vendorInvoiceNumber}
                      </RecordLink>
                      {line.vendorInvoice.vendorInvoiceDate ? ` · ${localDate(line.vendorInvoice.vendorInvoiceDate)}` : ""}
                      {` · ${line.vendorInvoice.status === "PAID" ? "Paid" : "Unpaid"}`}
                      {line.containerNumber ? ` · ${line.containerNumber}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums">{formatIdr(vendorInvoiceInvoiceLineNet(line))}</span>
                  {followsInvoice ? null : (
                  <CostingWriteGate>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Unmatch ${line.productDescription}`}
                      title="Unmatch"
                      disabled={unmatch.isPending}
                      onClick={() => unmatch.mutate(line.id)}
                    >
                      <IconLinkOff className="size-4" />
                    </Button>
                  </CostingWriteGate>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

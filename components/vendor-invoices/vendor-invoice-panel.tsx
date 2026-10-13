"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import {
  IconArrowUpRight,
  IconBox,
  IconBuildingStore,
  IconEye,
  IconFile,
  IconPencil,
  IconPlus,
  IconReceipt,
  IconTrash,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { RecordLink } from "@/components/record-link"
import type {
  VendorInvoiceAttachment,
  VendorInvoiceBreakdown,
} from "@/app/dashboard/vendor-invoices/columns"
import { formatIdr } from "@/components/dashboard/overview-card"
import DocumentUploadForm from "@/components/forms/document-upload-form"
import VendorInvoiceBreakdownForm from "@/components/forms/vendor-invoice-breakdown-form"
import VendorInvoiceHeaderForm from "@/components/forms/vendor-invoice-header-form"
import { Button } from "@/components/ui/button"
import { formatVendorInvoiceContainerMix } from "@/components/ui/container-summary-tags"
import { CopyButton } from "@/components/ui/copy-button"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VendorInvoiceWriteGate } from "@/components/write-gates"
import { usePermissions } from "@/hooks/use-permissions"
import {
  useDeleteVendorInvoice,
  useDeleteVendorInvoiceBreakdown,
  useUpdateVendorInvoice,
  useVendorInvoiceById,
} from "@/hooks/use-vendor-invoices"
import { glassTabsTrigger } from "@/lib/design"
import {
  cn,
  localDate,
  vendorInvoiceInvoiceLineNet,
  vendorInvoiceInvoiceTotals,
  vendorInvoiceLineGross,
} from "@/lib/utils"
import { vendorInvoiceService } from "@/services/vendor-invoice.service"

function number(value: number | string | null | undefined, digits = 2) {
  return Number(value ?? 0).toLocaleString("id-ID", { maximumFractionDigits: digits })
}

/** Payment state as a two-option switch so the current state is always visible. */
function PaymentSwitch({
  paid,
  disabled,
  onChange,
}: {
  paid: boolean
  disabled?: boolean
  onChange: (paid: boolean) => void
}) {
  const options = [
    { value: false, label: "Unpaid" },
    { value: true, label: "Paid" },
  ]
  return (
    <div role="radiogroup" aria-label="Payment status" className="flex h-9 items-center rounded-full bg-muted p-0.5">
      {options.map((option) => {
        const active = option.value === paid
        return (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => !active && onChange(option.value)}
            className={cn(
              "flex h-full cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors disabled:cursor-wait",
              active
                ? option.value
                  ? "bg-[var(--mli-success-container)] text-[var(--mli-on-success-container)] shadow-sm"
                  : "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                option.value ? "bg-[var(--mli-positive)]" : "bg-[var(--mli-on-backup-container)]"
              )}
            />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium text-foreground">{children}</dd>
    </div>
  )
}

function LineItem({
  line,
  index,
  vendorInvoiceId,
}: {
  line: VendorInvoiceBreakdown
  index: number
  vendorInvoiceId: string
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const deleteLine = useDeleteVendorInvoiceBreakdown(vendorInvoiceId)
  const vat = Number(line.vatPercentage ?? 0)
  const pph = Number(line.pph23Percentage ?? 0)
  const rate = Number(line.currencyPrice ?? 1)
  const container = [line.containerNumber, line.containerSize?.name, line.containerType?.name]
    .filter(Boolean)
    .join(" · ")

  return (
    <li className="group flex gap-3 rounded-xl border border-border p-3.5 transition-colors hover:border-input">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <p className="min-w-0 flex-1 text-sm font-medium text-foreground">{line.productDescription}</p>
          <p className="shrink-0 text-right">
            <span className="block text-sm font-semibold tabular-nums text-foreground">
              {formatIdr(vendorInvoiceInvoiceLineNet(line))}
            </span>
            {vat || pph ? (
              <span className="block text-[11px] tabular-nums text-muted-foreground">
                gross {formatIdr(vendorInvoiceLineGross(line))}
              </span>
            ) : null}
          </p>
        </div>
        <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
          {number(line.quantity, 0)} × {number(line.price)}
          {rate !== 1 ? ` × ${number(rate)} rate` : ""}
          {vat ? ` · VAT ${number(vat)}%` : ""}
          {pph ? ` · PPH 23 ${number(pph)}%` : ""}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {container ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
              <IconBox className="size-3" />
              {container}
            </span>
          ) : null}
          {line.costing ? (
            <RecordLink module="COSTING"
              href={`/dashboard/costings?costing=${line.costing.id}`}
              title={`Matched to costing: ${line.costing.costingDescription ?? line.productDescription}`}
              className="inline-flex max-w-[16rem] items-center gap-1 truncate rounded-full bg-[var(--mli-success-container)] px-2 py-0.5 text-[11px] font-medium text-[var(--mli-on-success-container)] hover:underline"
            >
              <span className="truncate">Costing · {line.costing.costingDescription ?? line.productDescription}</span>
            </RecordLink>
          ) : (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              Not matched to costing
            </span>
          )}
          <VendorInvoiceWriteGate>
            <span className="ml-auto flex items-center gap-0.5 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
              <VendorInvoiceBreakdownForm
                mode="edit"
                vendorInvoiceId={vendorInvoiceId}
                breakdown={line}
                trigger={
                  <Button variant="ghost" size="icon-sm" aria-label={`Edit ${line.productDescription}`}>
                    <IconPencil className="size-4" />
                  </Button>
                }
              />
              <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`Remove ${line.productDescription}`}>
                    <IconTrash className="size-4 text-[var(--mli-on-error-container)]" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Remove line?</DialogTitle>
                    <DialogDescription>
                      Remove “{line.productDescription}” from this invoice. Totals update immediately.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DeleteConfirmButton
                      isPending={deleteLine.isPending}
                      onClick={() => deleteLine.mutate(line.id, { onSuccess: () => setConfirmOpen(false) })}
                    />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </span>
          </VendorInvoiceWriteGate>
        </div>
      </div>
    </li>
  )
}

function DeleteInvoiceButton({ id, number: invoiceNumber, onDeleted }: { id: string; number: string; onDeleted?: () => void }) {
  const [open, setOpen] = useState(false)
  const deleteInvoice = useDeleteVendorInvoice()
  return (
    <Dialog open={open} onOpenChange={(next) => !deleteInvoice.isPending && setOpen(next)}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Delete vendor invoice" title="Delete vendor invoice">
          <IconTrash className="text-[var(--mli-on-error-container)]" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete vendor invoice?</DialogTitle>
          <DialogDescription>
            {invoiceNumber} and all of its lines and documents will be removed. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={deleteInvoice.isPending}>Cancel</Button>
          </DialogClose>
          <DeleteConfirmButton
            isPending={deleteInvoice.isPending}
            onClick={() =>
              deleteInvoice.mutate(id, {
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
          <Skeleton className="h-5 w-48 rounded-full" />
          <Skeleton className="h-4 w-32 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-24 rounded-xl" />
      <Skeleton className="h-10 w-60 rounded-full" />
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-20 rounded-xl" />
      ))}
    </div>
  )
}

export function VendorInvoicePanel({
  vendorInvoiceId,
  onClose,
  onDeleted,
  showOpenFullPage = true,
  className,
}: {
  vendorInvoiceId: string
  onClose?: () => void
  onDeleted?: () => void
  showOpenFullPage?: boolean
  className?: string
}) {
  const { data: invoice, isLoading, error } = useVendorInvoiceById(vendorInvoiceId)
  const updateInvoice = useUpdateVendorInvoice()
  const { canView } = usePermissions()
  const [tab, setTab] = useState("lines")

  if (isLoading) return <div className={className}><PanelSkeleton /></div>
  if (error || !invoice) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3 p-10 text-center", className)}>
        <p className="text-sm text-muted-foreground">{error?.message ?? "This vendor invoice could not be loaded."}</p>
        {onClose ? <Button variant="outline" onClick={onClose}>Close</Button> : null}
      </div>
    )
  }

  const lines = invoice.vendorInvoiceBreakdowns ?? []
  const attachments = invoice.vendorInvoiceAttachments ?? []
  const totals = vendorInvoiceInvoiceTotals(lines)
  const paid = invoice.status === "PAID"
  const containerMix = formatVendorInvoiceContainerMix(lines)
  const costed = lines.filter((line) => line.costing).length

  const setPaid = (nextPaid: boolean) => {
    const today = new Date().toISOString().slice(0, 10)
    updateInvoice.mutate(
      {
        id: invoice.id,
        vendorInvoice: {
          status: nextPaid ? "PAID" : "UNPAID",
          paymentDate: nextPaid ? invoice.paymentDate?.slice(0, 10) || today : null,
        },
      },
      {
        onSuccess: () => toast.success(nextPaid ? "Marked as paid" : "Marked as unpaid"),
        onError: (err: Error) => toast.error(err.message),
      }
    )
  }

  const addLine = (
    <VendorInvoiceWriteGate>
      <VendorInvoiceBreakdownForm
        mode="create"
        vendorInvoiceId={invoice.id}
        trigger={
          <Button size="sm">
            <IconPlus className="size-4" />
            Add line
          </Button>
        }
      />
    </VendorInvoiceWriteGate>
  )

  const uploadDocument = (
    <VendorInvoiceWriteGate>
      <DocumentUploadForm mode="create" vendorInvoiceId={invoice.id} attachmentName={undefined} document={undefined} />
    </VendorInvoiceWriteGate>
  )

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      {/* Parent: the invoice itself */}
      <header className="border-b border-border p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl brand-fill">
              <IconReceipt className="size-6" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="break-all font-mono text-lg font-semibold tracking-[-0.02em] text-foreground sm:truncate sm:text-xl">
                  {invoice.vendorInvoiceNumber}
                </h2>
                <CopyButton value={invoice.vendorInvoiceNumber} label="Invoice number" />
                {invoice.vendorInvoiceType === "REIMBURSEMENT" ? (
                  <span className="rounded-full bg-[var(--mli-warning-container)] px-2 py-0.5 text-[11px] font-medium text-[var(--mli-on-warning-container)]">
                    Reimbursement
                  </span>
                ) : null}
              </div>
              <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                <IconBuildingStore className="size-4 shrink-0" />
                {invoice.vendor?.id && canView("VENDOR") ? (
                  <Link href={`/dashboard/vendors/${invoice.vendor.id}`} className="truncate hover:text-foreground hover:underline">
                    {invoice.vendor.vendorName}
                    {invoice.vendor.vendorCode ? ` (${invoice.vendor.vendorCode})` : ""}
                  </Link>
                ) : (
                  <span className="truncate">{invoice.vendor?.vendorName ?? "Unknown vendor"}</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {showOpenFullPage ? (
              <Button asChild variant="ghost" size="icon" aria-label="Open full page" title="Open full page">
                <Link href={`/dashboard/vendor-invoices/${invoice.id}`}>
                  <IconArrowUpRight />
                </Link>
              </Button>
            ) : null}
            <VendorInvoiceWriteGate>
              <DeleteInvoiceButton id={invoice.id} number={invoice.vendorInvoiceNumber} onDeleted={onDeleted} />
            </VendorInvoiceWriteGate>
            {onClose ? (
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close details">
                <IconX />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <VendorInvoiceWriteGate>
            <PaymentSwitch paid={paid} disabled={updateInvoice.isPending} onChange={setPaid} />
          </VendorInvoiceWriteGate>
          <VendorInvoiceWriteGate>
            <VendorInvoiceHeaderForm
              id={invoice.id}
              vendorId={invoice.vendorId}
              vendorInvoiceNumber={invoice.vendorInvoiceNumber}
              vendorInvoiceDate={invoice.vendorInvoiceDate}
              vendorInvoiceType={invoice.vendorInvoiceType}
              vendorVessel={invoice.vendorVessel}
              paymentDate={invoice.paymentDate}
            />
          </VendorInvoiceWriteGate>
          {invoice.updatedBy?.name && invoice.updatedAt ? (
            <p className="ml-auto text-xs text-muted-foreground">
              Updated {localDate(invoice.updatedAt)} by {invoice.updatedBy.name}
            </p>
          ) : null}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Meta label="Invoice date">{invoice.vendorInvoiceDate ? localDate(invoice.vendorInvoiceDate) : "—"}</Meta>
          <Meta label="Payment date">{invoice.paymentDate ? localDate(invoice.paymentDate) : paid ? "—" : "Not paid yet"}</Meta>
          <Meta label="Vessel">{invoice.vendorVessel || "—"}</Meta>
          <Meta label="Containers">{containerMix || "—"}</Meta>
        </dl>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
        {/* Receipt-style totals: what the lines add up to and what is owed. */}
        <section aria-label="Invoice totals" className="grid grid-cols-2 overflow-hidden rounded-xl border border-border sm:grid-cols-4">
          {[
            { label: "Gross", value: totals.gross, sign: "" },
            { label: "VAT", value: totals.vatAmount, sign: "+ " },
            { label: "PPH 23", value: totals.pph23Amount, sign: "− " },
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
            <p className="text-xs opacity-80">Payable to vendor</p>
            <p className="mt-1 text-[17px] font-semibold tabular-nums">{formatIdr(totals.net)}</p>
          </div>
        </section>

        <Tabs value={tab} onValueChange={setTab} className="gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList className="h-10">
              <TabsTrigger value="lines" className={glassTabsTrigger}>
                Lines <span className="tabular-nums opacity-70">{lines.length}</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className={glassTabsTrigger}>
                Documents <span className="tabular-nums opacity-70">{attachments.length}</span>
              </TabsTrigger>
            </TabsList>
            {tab === "lines" && lines.length > 0 ? addLine : null}
            {tab === "documents" && attachments.length > 0 ? uploadDocument : null}
          </div>

          <TabsContent value="lines" className="space-y-3">
            {lines.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-4 py-10 text-center">
                <span className="flex size-11 items-center justify-center rounded-full bg-muted">
                  <IconBox className="size-5 text-muted-foreground" />
                </span>
                <p className="font-medium text-foreground">No lines yet</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Break the invoice into its charges so totals, taxes and costing stay accurate.
                </p>
                {addLine}
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  {costed} of {lines.length} line{lines.length === 1 ? "" : "s"} matched to a costing
                </p>
                <ol className="space-y-2">
                  {lines.map((line, index) => (
                    <LineItem key={line.id} line={line} index={index} vendorInvoiceId={invoice.id} />
                  ))}
                </ol>
                <dl className="ml-auto max-w-xs space-y-1.5 rounded-xl bg-muted/70 p-4 text-sm">
                  <div className="flex justify-between gap-6">
                    <dt className="text-muted-foreground">Gross</dt>
                    <dd className="tabular-nums">{formatIdr(totals.gross)}</dd>
                  </div>
                  <div className="flex justify-between gap-6">
                    <dt className="text-muted-foreground">VAT</dt>
                    <dd className="tabular-nums">+ {formatIdr(totals.vatAmount)}</dd>
                  </div>
                  <div className="flex justify-between gap-6">
                    <dt className="text-muted-foreground">PPH 23 withheld</dt>
                    <dd className="tabular-nums">− {formatIdr(totals.pph23Amount)}</dd>
                  </div>
                  <div className="flex justify-between gap-6 border-t border-border pt-1.5 font-semibold">
                    <dt>Payable</dt>
                    <dd className="tabular-nums">{formatIdr(totals.net)}</dd>
                  </div>
                </dl>
              </>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-3">
            {attachments.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-4 py-10 text-center">
                <span className="flex size-11 items-center justify-center rounded-full bg-muted">
                  <IconFile className="size-5 text-muted-foreground" />
                </span>
                <p className="font-medium text-foreground">No documents yet</p>
                <p className="max-w-xs text-sm text-muted-foreground">Upload the vendor invoice PDF or supporting files.</p>
                {uploadDocument}
              </div>
            ) : (
              <ul className="space-y-2">
                {attachments.map((attachment: VendorInvoiceAttachment) => (
                  <li key={attachment.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <IconFile className="size-5 text-muted-foreground" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{attachment.attachmentName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {attachment.fileName} · {localDate(attachment.updatedAt)}
                        {attachment.updatedBy?.name ? ` by ${attachment.updatedBy.name}` : ""}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`View ${attachment.attachmentName}`}
                      onClick={() => {
                        void vendorInvoiceService
                          .viewAttachment(invoice.id, attachment.id)
                          .catch((err: unknown) => {
                            toast.error(err instanceof Error ? err.message : "Unable to open attachment")
                          })
                      }}
                    >
                      <IconEye className="size-4" />
                    </Button>
                    <VendorInvoiceWriteGate>
                      <DocumentUploadForm
                        mode="edit"
                        vendorInvoiceId={invoice.id}
                        id={attachment.id}
                        attachmentName={attachment.attachmentName}
                        document={undefined}
                      />
                    </VendorInvoiceWriteGate>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

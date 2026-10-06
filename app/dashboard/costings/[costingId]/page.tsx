"use client"

import { use, useState } from "react"
import Link from "next/link"
import {
  IconArrowLeft,
  IconBox,
  IconBuildingStore,
  IconEye,
  IconFile,
  IconLinkOff,
  IconReceipt,
  IconShip,
  IconTrash,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import DocumentUploadForm from "@/components/forms/document-upload-form"
import CostingHeaderForm from "@/components/forms/costing-header-form"
import CostingBreakdownForm from "@/components/forms/costing-breakdown-form"
import { AssignBreakdownsToShipmentForm } from "@/components/forms/assign-breakdowns-shipment-form"
import {
  useCostingById,
  useDeleteCostingBreakdown,
  useUpdateCosting,
} from "@/hooks/use-costings"
import type { CostingAttachment } from "@/app/dashboard/costings/columns"
import {
  formatCostingContainerMix,
  extractCostingContainers,
} from "@/components/ui/container-summary-tags"
import {
  cn,
  costingInvoiceLineNet,
  costingInvoiceTotals,
  costingLinePph23Amount,
  costingLineUnitPlusPpn,
  localDate,
} from "@/lib/utils"
import { costingService } from "@/services/costing.service"
import CostingLoading from "@/components/loading/costing-loading"
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
import { CostingWriteGate } from "@/components/write-gates"
import ErrorPage from "@/components/error-page"
import {
  PaymentStatusChip,
  UnlinkedChip,
  VendorInvoiceTypeChip,
  WarningChip,
} from "@/components/ui/status-chip"
import {
  brandLink,
  brandText,
  glassInset,
  glassPanel,
  glassShine,
} from "@/lib/design"
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
import { DeleteConfirmButton } from "@/components/ui/delete-confirm-button"

function SectionIntro({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h2 className="text-headline-md font-semibold tracking-tight">{title}</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

function OverviewField({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="text-sm font-medium text-foreground">{children}</div>
    </div>
  )
}

function formatIdr(value: number) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

export default function CostingDetailPage({
  params,
}: {
  params: Promise<{ costingId: string }>
}) {
  const { costingId } = use(params)
  const updateCosting = useUpdateCosting()
  const deleteBreakdown = useDeleteCostingBreakdown(costingId)
  const { data: costing, isLoading, error } = useCostingById(costingId)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  if (isLoading) return <CostingLoading />
  if (error) return <ErrorPage message={error.message} />
  if (!costing) {
    return (
      <ErrorPage
        title="Costing not found"
        message="Unable to load this costing."
      />
    )
  }

  const attachments = costing.costingsAttachments ?? []
  const lines = costing.costingBreakdowns ?? []
  const detectedContainers = extractCostingContainers(lines)
  const containerMix = formatCostingContainerMix(lines)
  const lineIds = lines.map((line) => line.id)
  const allSelected =
    lineIds.length > 0 && lineIds.every((id) => selectedIds.includes(id))
  const someSelected =
    selectedIds.length > 0 && !allSelected
  const selectedSet = new Set(selectedIds)
  const totals = costingInvoiceTotals(lines)
  const unassignedCount = lines.filter((line) => !line.shipmentId).length
  const isPaid = costing.status === "PAID"
  const updatedByName = costing.updatedBy?.name

  return (
    <DashboardPage atmosphere>
      <div className="mb-6">
        <Button asChild variant="ghost" className="text-muted-foreground">
          <Link href="/dashboard/costings">
            <IconArrowLeft className="size-5" />
            Back to costings
          </Link>
        </Button>
      </div>

      <section className={cn(glassPanel, "relative mb-8 overflow-hidden")}>
        <div aria-hidden className={glassShine} />

        <div className="relative space-y-8 p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4 sm:gap-5">
              <div
                className={cn(
                  glassInset,
                  "flex size-14 shrink-0 items-center justify-center sm:size-16"
                )}
              >
                <IconReceipt className="size-8 text-[var(--mli-primary-container)] sm:size-9" />
              </div>
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <PaymentStatusChip paid={isPaid} />
                  <VendorInvoiceTypeChip type={costing.vendorInvoiceType} />
                  {unassignedCount > 0 ? (
                    <WarningChip>{unassignedCount} lines unassigned</WarningChip>
                  ) : null}
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                    Vendor costing
                  </p>
                  <h1 className={cn(brandText, "text-headline-lg break-all")}>
                    {costing.costingNumber}
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  {costing.vendor?.vendorName ?? "Unknown vendor"}
                  {costing.vendorInvoiceNumber
                    ? ` · Inv. ${costing.vendorInvoiceNumber}`
                    : ""}
                  {updatedByName
                    ? ` · Updated by ${updatedByName}`
                    : ""}
                </p>
              </div>
            </div>

            <CostingWriteGate>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const nextPaid = !isPaid
                    const today = new Date().toISOString().slice(0, 10)
                    updateCosting.mutate(
                      {
                        id: costingId,
                        costing: {
                          status: nextPaid ? "PAID" : "UNPAID",
                          paymentDate: nextPaid
                            ? costing.paymentDate?.slice(0, 10) || today
                            : null,
                        },
                      },
                      {
                        onSuccess: () => {
                          toast.success(
                            nextPaid ? "Marked as paid" : "Marked as unpaid"
                          )
                        },
                        onError: (err: Error) => toast.error(err.message),
                      }
                    )
                  }}
                  disabled={updateCosting.isPending}
                >
                  {updateCosting.isPending
                    ? "Updating…"
                    : isPaid
                      ? "Mark unpaid"
                      : "Mark paid"}
                </Button>
                <CostingHeaderForm
                  id={costing.id}
                  vendorId={costing.vendorId}
                  vendorInvoiceNumber={costing.vendorInvoiceNumber}
                  vendorInvoiceDate={costing.vendorInvoiceDate}
                  vendorInvoiceType={costing.vendorInvoiceType}
                  vendorVessel={costing.vendorVessel}
                  paymentDate={costing.paymentDate}
                />
              </div>
            </CostingWriteGate>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className={cn(glassInset, "flex flex-col gap-2 px-5 py-4")}>
              <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                Gross
              </p>
              <p className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                {formatIdr(totals.gross)}
              </p>
              <p className="text-xs text-muted-foreground">
                {lines.length} line{lines.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className={cn(glassInset, "flex flex-col gap-2 px-5 py-4")}>
              <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                VAT
              </p>
              <p className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                {formatIdr(totals.vatAmount)}
              </p>
            </div>
            <div className={cn(glassInset, "flex flex-col gap-2 px-5 py-4")}>
              <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                PPH 23
              </p>
              <p className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                − {formatIdr(totals.pph23Amount)}
              </p>
            </div>
            <div className={cn(glassInset, "flex flex-col gap-2 px-5 py-4")}>
              <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                Vendor payable
              </p>
              <p className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                {formatIdr(totals.net)}
              </p>
              <p className="text-xs text-muted-foreground">Amount due to vendor</p>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-6">
          <DashboardPageCard>
            <SectionIntro
              title="Breakdowns"
              description="Break the invoice into charges. Select one or more rows to assign them to a shipment."
              action={
                <CostingWriteGate>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {selectedIds.length > 0 ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedIds([])}
                        >
                          Clear selection
                        </Button>
                        <AssignBreakdownsToShipmentForm
                          costingId={costingId}
                          breakdownIds={selectedIds}
                          onAssigned={() => setSelectedIds([])}
                        />
                      </>
                    ) : null}
                    <CostingBreakdownForm mode="create" costingId={costingId} />
                  </div>
                </CostingWriteGate>
              }
            />

            {lines.length === 0 ? (
              <div
                className={cn(
                  glassInset,
                  "flex flex-col items-center justify-center gap-3 px-6 py-14 text-center"
                )}
              >
                <IconBox className="size-8 text-[var(--mli-primary-container)]" />
                <p className="font-semibold">No breakdowns yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Add charges from the vendor invoice so totals stay accurate.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border border-[rgba(214,227,255,0.4)]">
                <table className="w-full min-w-[1280px] text-left text-sm">
                  <thead className="bg-[rgba(232,238,246,0.55)] text-muted-foreground">
                    <tr>
                      <th className="w-12 px-4 py-3">
                        <Checkbox
                          checked={
                            allSelected
                              ? true
                              : someSelected
                                ? "indeterminate"
                                : false
                          }
                          onCheckedChange={(checked) => {
                            setSelectedIds(checked ? lineIds : [])
                          }}
                          aria-label="Select all breakdowns"
                        />
                      </th>
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Qty</th>
                      <th className="px-4 py-3 font-medium">Unit</th>
                      <th className="px-4 py-3 font-medium">FX</th>
                      <th className="px-4 py-3 font-medium">VAT %</th>
                      <th className="px-4 py-3 font-medium">PPH 23 %</th>
                      <th className="px-4 py-3 font-medium text-right">
                        Unit + PPN
                      </th>
                      <th className="px-4 py-3 font-medium text-right">
                        PPH 23 amt
                      </th>
                      <th className="px-4 py-3 font-medium">Container</th>
                      <th className="px-4 py-3 font-medium">Shipment</th>
                      <th className="px-4 py-3 font-medium text-right">
                        Net amount
                      </th>
                      <th className="px-4 py-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line) => {
                      const isSelected = selectedSet.has(line.id)
                      return (
                      <tr
                        key={line.id}
                        className={cn(
                          "border-t border-[rgba(214,227,255,0.28)]",
                          isSelected && "bg-[rgba(214,227,255,0.22)]"
                        )}
                      >
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              setSelectedIds((prev) =>
                                checked
                                  ? prev.includes(line.id)
                                    ? prev
                                    : [...prev, line.id]
                                  : prev.filter((id) => id !== line.id)
                              )
                            }}
                            aria-label={`Select ${line.productDescription}`}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {line.productDescription}
                        </td>
                        <td className="px-4 py-3 tabular-nums">{line.quantity}</td>
                        <td className="px-4 py-3 tabular-nums">
                          {Number(line.price).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {Number(line.currencyPrice).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {Number(line.vatPercentage ?? 0).toLocaleString(
                            "id-ID",
                            { maximumFractionDigits: 2 }
                          )}
                          %
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          {Number(line.pph23Percentage ?? 0).toLocaleString(
                            "id-ID",
                            { maximumFractionDigits: 2 }
                          )}
                          %
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatIdr(costingLineUnitPlusPpn(line))}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatIdr(costingLinePph23Amount(line))}
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            <p>{line.containerNumber || "—"}</p>
                            <p className="text-xs text-muted-foreground">
                              {[line.containerSize?.name, line.containerType?.name]
                                .filter(Boolean)
                                .join(" · ") || null}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {line.shipment ? (
                            <Link
                              href={`/dashboard/shipments/${line.shipment.id}`}
                              className={brandLink}
                            >
                              {line.shipment.orderNumber}
                            </Link>
                          ) : (
                            <span className="inline-flex items-center gap-1.5">
                              <UnlinkedChip />
                              <IconLinkOff className="size-3.5 text-muted-foreground" />
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium">
                          {formatIdr(costingInvoiceLineNet(line))}
                        </td>
                        <td className="px-4 py-3">
                          <CostingWriteGate>
                            <div className="flex justify-end gap-1">
                              <CostingBreakdownForm
                                mode="edit"
                                costingId={costingId}
                                breakdown={line}
                              />
                              <Dialog
                                open={deletingId === line.id}
                                onOpenChange={(open) =>
                                  setDeletingId(open ? line.id : null)
                                }
                              >
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon-sm">
                                    <IconTrash className="size-4 text-[var(--mli-on-error-container)]" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Remove breakdown?</DialogTitle>
                                    <DialogDescription>
                                      Remove “{line.productDescription}” from this
                                      invoice.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <DeleteConfirmButton
                                      isPending={deleteBreakdown.isPending}
                                      onClick={() =>
                                        deleteBreakdown.mutate(line.id, {
                                          onSuccess: () => {
                                            setDeletingId(null)
                                            setSelectedIds((prev) =>
                                              prev.filter((id) => id !== line.id)
                                            )
                                          },
                                        })
                                      }
                                    />
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </CostingWriteGate>
                        </td>
                      </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardPageCard>

          <DashboardPageCard>
            <SectionIntro
              title="Invoice details"
              description="Vendor invoice metadata used for reconciliation."
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <OverviewField label="Vendor">
                <span className="inline-flex items-center gap-2">
                  <IconBuildingStore className="size-4 text-muted-foreground" />
                  {costing.vendor?.vendorName ?? "—"}
                </span>
              </OverviewField>
              <OverviewField label="Vendor invoice # / RO #">
                {costing.vendorInvoiceNumber || "—"}
              </OverviewField>
              <OverviewField label="Document type">
                <VendorInvoiceTypeChip type={costing.vendorInvoiceType} />
              </OverviewField>
              <OverviewField label="Vessel">
                <span className="inline-flex items-center gap-2">
                  <IconShip className="size-4 text-muted-foreground" />
                  {costing.vendorVessel || "—"}
                </span>
              </OverviewField>
              <OverviewField label="Invoice date">
                {costing.vendorInvoiceDate
                  ? localDate(costing.vendorInvoiceDate)
                  : "—"}
              </OverviewField>
              <OverviewField label="Payment date">
                {costing.paymentDate ? localDate(costing.paymentDate) : "—"}
              </OverviewField>
            </div>
          </DashboardPageCard>

          <DashboardPageCard>
            <SectionIntro
              title="Containers"
              description={
                detectedContainers.length > 0
                  ? `Detected from breakdown lines${containerMix ? ` · ${containerMix}` : ""}.`
                  : "Containers are detected automatically when size, type, or number is set on a breakdown."
              }
            />
            {detectedContainers.length === 0 ? (
              <div
                className={cn(
                  glassInset,
                  "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
                )}
              >
                <IconBox className="size-8 text-[var(--mli-primary-container)]" />
                <p className="font-semibold">No containers detected</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Add a container number, size, or type on a breakdown line to see
                  it here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border border-[rgba(214,227,255,0.4)]">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="bg-[rgba(232,238,246,0.55)] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Container number</th>
                      <th className="px-4 py-3 font-medium">Size</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detectedContainers.map((container) => (
                      <tr
                        key={container.key}
                        className="border-t border-[rgba(214,227,255,0.28)]"
                      >
                        <td className="px-4 py-3 font-medium">
                          {container.containerNumber || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {container.containerSize?.name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {container.containerType?.name || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardPageCard>

          <DashboardPageCard>
            <SectionIntro
              title="Documents"
              description="Upload the vendor invoice PDF or supporting files."
              action={
                <CostingWriteGate>
                  <DocumentUploadForm
                    mode="create"
                    module="costing"
                    costingId={costingId}
                    attachmentName={undefined}
                    document={undefined}
                  />
                </CostingWriteGate>
              }
            />
            {attachments.length === 0 ? (
              <div
                className={cn(
                  glassInset,
                  "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
                )}
              >
                <IconFile className="size-8 text-[var(--mli-primary-container)]" />
                <p className="font-semibold">No documents yet</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {attachments.map((attachment: CostingAttachment) => (
                  <li
                    key={attachment.id}
                    className={cn(
                      glassInset,
                      "flex items-center justify-between gap-3 px-4 py-3"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {attachment.attachmentName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {localDate(attachment.updatedAt)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        costingService.viewCostingAttachment(
                          costingId,
                          attachment.id
                        )
                      }
                    >
                      <IconEye className="size-4" />
                      View
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </DashboardPageCard>
      </div>
    </DashboardPage>
  )
}

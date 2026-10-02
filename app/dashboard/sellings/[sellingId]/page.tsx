"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconArrowLeft,
  IconBuildingStore,
  IconReceipt,
  IconShip,
  IconTrash,
} from "@tabler/icons-react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { TextField } from "@/components/ui/text-field"
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
import { DashboardPage, DashboardPageCard } from "@/components/layout/dashboard-page"
import ErrorPage from "@/components/error-page"
import SellingLoading from "@/components/loading/selling-loading"
import { PermissionGate } from "@/components/permission-gate"
import LinkSellingLinesForm from "@/components/forms/link-selling-lines-form"
import { SellingStatusChip } from "@/components/ui/status-chip"
import {
  useDeleteSelling,
  useDeleteSellingLine,
  useIssueSelling,
  useMarkSellingPaid,
  useMarkSellingUnpaid,
  useRevertSellingToDraft,
  useSellingById,
  useUpdateSelling,
} from "@/hooks/use-sellings"
import { usePermissions } from "@/hooks/use-permissions"
import { useShipmentById } from "@/hooks/use-shipments"
import { brandLink, brandText, glassInset, glassPanel, glassShine } from "@/lib/design"
import { cn, costingSellingLineNet, localDate } from "@/lib/utils"

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
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  )
}

function formatIdr(value: number) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

function toDateInput(value?: string | null) {
  if (!value) return ""
  return value.slice(0, 10)
}

function TaxInvoiceFields({
  sellingId,
  taxInvoice,
  taxInvoiceDate,
}: {
  sellingId: string
  taxInvoice?: string | null
  taxInvoiceDate?: string | null
}) {
  const updateSelling = useUpdateSelling()
  const [invoice, setInvoice] = useState(taxInvoice ?? "")
  const [date, setDate] = useState(toDateInput(taxInvoiceDate))

  useEffect(() => {
    setInvoice(taxInvoice ?? "")
    setDate(toDateInput(taxInvoiceDate))
  }, [taxInvoice, taxInvoiceDate])

  const savedInvoice = (taxInvoice ?? "").trim()
  const savedDate = toDateInput(taxInvoiceDate)
  const dirty = invoice.trim() !== savedInvoice || date !== savedDate

  return (
    <div className="space-y-3 sm:col-span-2 lg:col-span-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="tax-invoice"
          label="Tax invoice"
          value={invoice}
          onChange={(event) => setInvoice(event.target.value)}
          placeholder="Tax invoice number"
          disabled={updateSelling.isPending}
        />
        <DatePicker
          id="tax-invoice-date"
          label="Tax invoice date"
          value={date}
          onValueChange={setDate}
          placeholder="Pick tax invoice date"
          outputFormat="date-only"
        />
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          disabled={!dirty || updateSelling.isPending}
          onClick={() =>
            updateSelling.mutate(
              {
                id: sellingId,
                selling: {
                  taxInvoice: invoice.trim() === "" ? null : invoice.trim(),
                  taxInvoiceDate: date === "" ? null : date,
                },
              },
              { onError: (err: Error) => toast.error(err.message) }
            )
          }
        >
          {updateSelling.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Save tax invoice"
          )}
        </Button>
      </div>
    </div>
  )
}

function DraftTermsOfPaymentField({
  sellingId,
  initialValue,
}: {
  sellingId: string
  initialValue?: string | null
}) {
  const updateSelling = useUpdateSelling()
  const [value, setValue] = useState(initialValue ?? "")

  useEffect(() => {
    setValue(initialValue ?? "")
  }, [initialValue])

  const saved = (initialValue ?? "").trim()
  const dirty = value.trim() !== saved

  return (
    <div className="space-y-3 sm:col-span-2 lg:col-span-3">
      <TextField
        id="terms-of-payment"
        label="Terms of payment"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Payment terms for this invoice"
        disabled={updateSelling.isPending}
      />
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          disabled={!dirty || updateSelling.isPending}
          onClick={() =>
            updateSelling.mutate(
              {
                id: sellingId,
                selling: {
                  termsOfPayment: value.trim() === "" ? null : value.trim(),
                },
              },
              { onError: (err: Error) => toast.error(err.message) }
            )
          }
        >
          {updateSelling.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Save terms"
          )}
        </Button>
      </div>
    </div>
  )
}

export default function SellingDetailPage({
  params,
}: {
  params: Promise<{ sellingId: string }>
}) {
  const { sellingId } = use(params)
  const router = useRouter()
  const { canWrite } = usePermissions()
  const { data, isLoading, error } = useSellingById(sellingId)
  const { data: shipment } = useShipmentById(data?.shipmentId ?? "")
  const issueSelling = useIssueSelling()
  const markPaid = useMarkSellingPaid()
  const markUnpaid = useMarkSellingUnpaid()
  const revertToDraft = useRevertSellingToDraft()
  const deleteSelling = useDeleteSelling()
  const deleteLine = useDeleteSellingLine()

  if (isLoading) return <SellingLoading />
  if (error) return <ErrorPage message={error.message} />
  if (!data) {
    return (
      <ErrorPage
        title="Invoice not found"
        message="Unable to load this customer invoice."
      />
    )
  }

  const lines = data.costingBreakdowns ?? []
  const isDraft = data.status === "DRAFT"
  const isUnpaid = data.status === "UNPAID"
  const isPaid = data.status === "PAID"
  const canEditTerms = isDraft && canWrite("sellings")
  const canEditTaxInvoice = canWrite("sellings")
  const netTotal = lines.reduce(
    (sum, line) => sum + costingSellingLineNet(line),
    0
  )
  const actionPending =
    issueSelling.isPending ||
    markPaid.isPending ||
    markUnpaid.isPending ||
    revertToDraft.isPending ||
    deleteSelling.isPending

  return (
    <DashboardPage atmosphere>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/dashboard/sellings"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <IconArrowLeft className="size-4" />
            Back to invoices
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className={cn(brandText, "text-headline-lg tracking-tight")}>
              {data.sellingNumber}
            </h1>
            <SellingStatusChip status={data.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Customer invoice for{" "}
            {data.customer?.customerName ?? "customer"} on shipment{" "}
            {data.shipment?.orderNumber ?? "—"}.
          </p>
        </div>
        <PermissionGate resource="sellings" write>
          <div className="flex flex-wrap gap-2">
            {isDraft ? (
              <Button
                type="button"
                onClick={() =>
                  issueSelling.mutate(data.id, {
                    onError: (err: Error) => toast.error(err.message),
                  })
                }
                disabled={actionPending || lines.length === 0}
              >
                {issueSelling.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Issue invoice"
                )}
              </Button>
            ) : null}
            {isUnpaid ? (
              <Button
                type="button"
                onClick={() =>
                  markPaid.mutate(data.id, {
                    onError: (err: Error) => toast.error(err.message),
                  })
                }
                disabled={actionPending}
              >
                {markPaid.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Mark paid"
                )}
              </Button>
            ) : null}
            {isPaid ? (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  markUnpaid.mutate(data.id, {
                    onError: (err: Error) => toast.error(err.message),
                  })
                }
                disabled={actionPending}
              >
                {markUnpaid.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Mark unpaid"
                )}
              </Button>
            ) : null}
            {!isDraft ? (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  revertToDraft.mutate(data.id, {
                    onError: (err: Error) => toast.error(err.message),
                  })
                }
                disabled={actionPending}
              >
                {revertToDraft.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Revert to draft"
                )}
              </Button>
            ) : null}
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" disabled={actionPending}>
                  <IconTrash className="size-4" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete invoice</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Delete {data.sellingNumber}? Linked costing lines will be
                  available to invoice again.
                </DialogDescription>
                <DialogFooter>
                  <DeleteConfirmButton
                    isPending={deleteSelling.isPending}
                    onClick={() =>
                      deleteSelling.mutate(data.id, {
                        onSuccess: () => router.push("/dashboard/sellings"),
                        onError: (err: Error) => toast.error(err.message),
                      })
                    }
                  />
                  <DialogClose asChild>
                    <Button
                      variant="secondary"
                      disabled={deleteSelling.isPending}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </PermissionGate>
      </div>

      <div className="grid gap-6">
        <DashboardPageCard>
          <SectionIntro
            title="Overview"
            description="Customer-facing invoice header. Amounts are frozen when the invoice is issued."
          />
          <div className={cn(glassPanel, "relative overflow-hidden p-5 sm:p-6")}>
            <div className={glassShine} aria-hidden />
            <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <OverviewField label="Customer">
                <span className="inline-flex items-center gap-2">
                  <IconBuildingStore className="size-4 text-muted-foreground" />
                  {data.customer?.customerName ?? "—"}
                </span>
              </OverviewField>
              <OverviewField label="Shipment">
                {data.shipment?.id ? (
                  <Link
                    href={`/dashboard/shipments/${data.shipment.id}`}
                    className={cn(brandLink, "inline-flex items-center gap-2")}
                  >
                    <IconShip className="size-4" />
                    {data.shipment.orderNumber}
                  </Link>
                ) : (
                  "—"
                )}
              </OverviewField>
              <OverviewField label="Net total">
                <span className="inline-flex items-center gap-2 font-medium">
                  <IconReceipt className="size-4 text-muted-foreground" />
                  {formatIdr(netTotal)}
                </span>
              </OverviewField>
              <OverviewField label="Invoice date">
                {data.invoiceDate ? localDate(data.invoiceDate) : "—"}
              </OverviewField>
              <OverviewField label="Payment date">
                {data.paymentDate ? localDate(data.paymentDate) : "—"}
              </OverviewField>
              <OverviewField label="Remarks">
                {data.remarks?.trim() || "—"}
              </OverviewField>
              {canEditTerms ? (
                <DraftTermsOfPaymentField
                  sellingId={data.id}
                  initialValue={data.termsOfPayment}
                />
              ) : (
                <OverviewField label="Terms of payment">
                  {data.termsOfPayment?.trim() || "—"}
                </OverviewField>
              )}
              {canEditTaxInvoice ? (
                <TaxInvoiceFields
                  sellingId={data.id}
                  taxInvoice={data.taxInvoice}
                  taxInvoiceDate={data.taxInvoiceDate}
                />
              ) : (
                <>
                  <OverviewField label="Tax invoice">
                    {data.taxInvoice?.trim() || "—"}
                  </OverviewField>
                  <OverviewField label="Tax invoice date">
                    {data.taxInvoiceDate ? localDate(data.taxInvoiceDate) : "—"}
                  </OverviewField>
                </>
              )}
            </div>
          </div>
        </DashboardPageCard>

        <DashboardPageCard>
          <SectionIntro
            title="Invoice lines"
            description="Linked costing lines on this invoice. While it is a draft, add more lines from the connected shipment."
            action={
              canEditTerms ? (
                <LinkSellingLinesForm
                  sellingId={data.id}
                  orderNumber={
                    data.shipment?.orderNumber ?? shipment?.orderNumber ?? "this shipment"
                  }
                  breakdowns={shipment?.costingBreakdowns ?? []}
                />
              ) : null
            }
          />
          {lines.length === 0 ? (
            <div className={cn(glassInset, "p-6 text-sm text-muted-foreground")}>
              No lines on this invoice yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[rgba(214,227,255,0.45)]">
              <table className="w-full min-w-[56rem] text-left">
                <thead>
                  <tr className="border-b border-[rgba(214,227,255,0.4)] bg-[rgba(232,238,246,0.45)]">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Line
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      VAT
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      PPH23
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Net
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Sourced from
                    </th>
                    {isDraft ? (
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground" />
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => {
                    const amount = Number(line.sellingAmount) || 0
                    const vat = Number(line.sellingVatPercentage) || 0
                    const pph = Number(line.sellingPph23Percentage) || 0
                    const net = costingSellingLineNet(line)
                    const source = line.costing

                    return (
                      <tr
                        key={line.id}
                        className="border-b border-[rgba(214,227,255,0.3)] last:border-0"
                      >
                        <td className="px-4 py-3 align-top">
                          <p className="text-sm font-medium">
                            {line.productDescription ?? "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3 align-top text-sm">
                          {formatIdr(amount)}
                        </td>
                        <td className="px-4 py-3 align-top text-sm">{vat}%</td>
                        <td className="px-4 py-3 align-top text-sm">{pph}%</td>
                        <td className="px-4 py-3 align-top text-sm font-medium">
                          {formatIdr(net)}
                        </td>
                        <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                          <div className="space-y-1">
                            {source?.id ? (
                              <Link
                                href={`/dashboard/costings/${source.id}`}
                                className={brandLink}
                              >
                                {source.costingNumber}
                              </Link>
                            ) : (
                              "—"
                            )}
                            <p>{source?.vendor?.vendorName ?? "—"}</p>
                          </div>
                        </td>
                        {isDraft ? (
                          <td className="px-4 py-3 align-top">
                            <PermissionGate resource="sellings" write>
                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  disabled={deleteLine.isPending}
                                  onClick={() =>
                                    deleteLine.mutate(
                                      { id: data.id, lineId: line.id },
                                      {
                                        onError: (err: Error) =>
                                          toast.error(err.message),
                                      }
                                    )
                                  }
                                >
                                  Remove
                                </Button>
                              </div>
                            </PermissionGate>
                          </td>
                        ) : null}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 flex justify-end text-sm text-muted-foreground">
            Total net:{" "}
            <span className="ml-2 font-semibold text-foreground">
              {formatIdr(netTotal)}
            </span>
          </div>
        </DashboardPageCard>
      </div>
    </DashboardPage>
  )
}

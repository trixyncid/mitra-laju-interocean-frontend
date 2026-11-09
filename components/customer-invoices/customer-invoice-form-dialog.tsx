"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import {
  IconCheck,
  IconEye,
  IconFileInvoice,
  IconHash,
  IconLock,
  IconPencil,
  IconPlus,
  IconPrinter,
  IconReceiptRefund,
  IconRestore,
  IconX,
} from "@tabler/icons-react"
import { Loader2 } from "lucide-react"

import { formatIdr } from "@/components/dashboard/overview-card"
import { invoiceBillTo } from "@/components/customer-invoices/invoice-bill-to"
import { invoiceTotals, todayDateOnly, toDateOnly } from "@/components/customer-invoices/invoice-format"
import { InvoicePrintSheet } from "@/components/customer-invoices/invoice-print-sheet"
import { ScaledPage } from "@/components/customer-invoices/scaled-page"
import { SearchableCombobox } from "@/components/searchable-combobox"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { TextField } from "@/components/ui/text-field"
import { useCustomerById } from "@/hooks/use-customers"
import { useCreateCustomerInvoice, useNextInvoiceNumber, useUpdateCustomerInvoice } from "@/hooks/use-customer-invoices"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useSales, useSalesSearch } from "@/hooks/use-sales"
import type {
  CustomerInvoice,
  CustomerInvoiceStatus,
  CustomerInvoiceType,
  CustomerInvoiceUpdate,
  SalesCustomerInvoice,
} from "@/lib/types/customer-invoice"
import { cn, vendorInvoiceLineGross } from "@/lib/utils"

const NONE = "-"

const TYPE_OPTIONS: { value: CustomerInvoiceType; title: string; body: string; icon: typeof IconFileInvoice }[] = [
  { value: "INVOICE", title: "Invoice", body: "Charges for the work.", icon: IconFileInvoice },
  { value: "REIMBURSEMENT", title: "Reimbursement", body: "Costs paid on the customer's behalf.", icon: IconReceiptRefund },
]

const STATUS_OPTIONS: { value: CustomerInvoiceStatus; label: string }[] = [
  { value: "UNPAID", label: "Unpaid" },
  { value: "PAID", label: "Paid" },
]

type EditableInvoice = (SalesCustomerInvoice | CustomerInvoice) & { salesId?: string }

type FormState = {
  salesId: string
  type: CustomerInvoiceType
  /** null = untouched, so the number keeps following the sales number. */
  number: string | null
  /** null = untouched, so every unbilled selling is billed. */
  sellingIds: string[] | null
  invoiceDate: string
  taxInvoice: string
  taxInvoiceDate: string
  status: CustomerInvoiceStatus
  paymentDate: string
  remarks: string
}

function initialState(salesId: string | undefined, invoice?: EditableInvoice): FormState {
  return {
    salesId: salesId ?? invoice?.salesId ?? NONE,
    type: invoice?.customerInvoiceType ?? "INVOICE",
    number: invoice ? invoice.customerInvoiceNumber : null,
    sellingIds: null,
    invoiceDate: invoice ? toDateOnly(invoice.customerInvoiceDate) : todayDateOnly(),
    taxInvoice: invoice?.taxInvoice ?? "",
    taxInvoiceDate: toDateOnly(invoice?.taxInvoiceDate),
    status: invoice?.customerInvoiceStatus ?? "UNPAID",
    paymentDate: toDateOnly(invoice?.paymentDate),
    remarks: invoice?.remarks ?? "",
  }
}

const blank = (value: string) => value.trim() || null

export function CustomerInvoiceFormDialog({
  mode,
  salesId: fixedSalesId,
  invoice,
  trigger,
  onSaved,
  defaultOpen = false,
  onOpenChange,
}: {
  mode: "create" | "edit"
  /** The job to bill. Without it (create from the invoice list) the form asks for one. */
  salesId?: string
  invoice?: EditableInvoice
  trigger?: ReactNode
  onSaved?: (invoice: CustomerInvoice) => void
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpenState] = useState(defaultOpen)
  const setOpen = (next: boolean) => {
    setOpenState(next)
    onOpenChange?.(next)
  }
  const [values, setValues] = useState<FormState>(() => initialState(fixedSalesId, invoice))
  const [salesSearch, setSalesSearch] = useState("")
  const [errors, setErrors] = useState<{ sales?: string; number?: string; sellings?: string }>({})
  const debouncedSalesSearch = useDebouncedValue(salesSearch.trim(), 300)
  const create = useCreateCustomerInvoice()
  const update = useUpdateCustomerInvoice()
  const pending = create.isPending || update.isPending
  const [letterhead, setLetterhead] = useState(true)
  /** Small screens show the form or the preview, not both. */
  const [mobileView, setMobileView] = useState<"form" | "preview">("form")

  const salesId = values.salesId === NONE ? undefined : values.salesId
  const pickSales = mode === "create" && !fixedSalesId
  const salesQuery = useSales(open ? (salesId ?? "") : "")
  const sales = salesQuery.data
  const salesOptions = useSalesSearch(debouncedSalesSearch, open && pickSales)
  const suggestion = useNextInvoiceNumber(salesId, values.type, open && mode === "create")

  const suggested = suggestion.data?.customerInvoiceNumber
  const number = values.number ?? suggested ?? ""
  const followsSales = sales ? number === sales.salesNumber : false

  // Lines this invoice may bill: unbilled ones, plus its own when editing.
  const sellings = sales?.sellings ?? []
  const billable = sellings.filter((line) => !line.customerInvoice || line.customerInvoice.id === invoice?.id)
  const billedElsewhere = sellings.filter((line) => line.customerInvoice && line.customerInvoice.id !== invoice?.id)
  const defaultSelection =
    mode === "edit"
      ? sellings.filter((line) => line.customerInvoice?.id === invoice?.id).map((line) => line.id)
      : billable.map((line) => line.id)
  const selectedIds = values.sellingIds ?? defaultSelection
  const selected = new Set(selectedIds)
  const totals = invoiceTotals(billable.filter((line) => selected.has(line.id)))
  const linesLocked = mode === "edit" && invoice?.customerInvoiceStatus === "PAID" && values.status === "PAID"

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setValues((current) => ({ ...current, [key]: value }))

  const toggleLine = (id: string) => {
    setErrors((current) => ({ ...current, sellings: undefined }))
    set("sellingIds", selected.has(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id])
  }

  const salesItems = (() => {
    const items = (salesOptions.data?.items ?? []).map((job) => ({
      value: job.id,
      label: `${job.salesNumber} · ${job.customer?.customerName ?? "No customer"}`,
    }))
    if (sales && !items.some((item) => item.value === sales.id)) {
      items.unshift({ value: sales.id, label: `${sales.salesNumber} · ${sales.customer?.customerName ?? "No customer"}` })
    }
    return items
  })()

  // The invoice as it will print, rebuilt from the form on every change.
  const billedCustomer = sales?.customer ?? sales?.shipment?.customerCode ?? null
  const customerQuery = useCustomerById(open ? (sales?.customer?.id ?? sales?.shipment?.customerCodeId ?? "") : "")
  const previewLines = billable.filter((line) => selected.has(line.id))
  const previewInvoice: CustomerInvoice | null = sales
    ? {
        id: invoice?.id ?? "preview",
        salesId: sales.id,
        sales: {
          id: sales.id,
          salesNumber: sales.salesNumber,
          salesType: sales.salesType,
          customer: sales.customer,
          shipment: sales.shipment
            ? {
                id: sales.shipment.id,
                customerCode: sales.shipment.customerCode,
                shipmentOperational: sales.shipment.shipmentOperational
                  ? {
                      bookingNumber: sales.shipment.shipmentOperational.bookingNumber,
                      blNumber: sales.shipment.shipmentOperational.blNumber,
                      vessel: sales.shipment.shipmentOperational.vessel,
                    }
                  : null,
              }
            : null,
        },
        sellings: previewLines,
        customerInvoiceNumber: number.trim() || "—",
        customerInvoiceType: values.type,
        customerInvoiceDate: values.invoiceDate || null,
        customerInvoiceStatus: values.status,
        paymentDate: values.paymentDate || null,
        taxInvoice: blank(values.taxInvoice),
        taxInvoiceDate: values.taxInvoiceDate || null,
        remarks: blank(values.remarks),
        createdAt: "",
        updatedAt: "",
      }
    : null

  const submit = async () => {
    const nextErrors: typeof errors = {}
    if (!salesId) nextErrors.sales = "Choose the sales job to bill"
    if (!number.trim()) nextErrors.number = "Invoice number is required"
    if (selectedIds.length === 0) nextErrors.sellings = "Select at least one selling to bill"
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const fields = {
      customerInvoiceType: values.type,
      customerInvoiceDate: values.invoiceDate || null,
      taxInvoice: blank(values.taxInvoice),
      taxInvoiceDate: values.taxInvoiceDate || null,
      customerInvoiceStatus: values.status,
      paymentDate: values.status === "PAID" ? values.paymentDate || null : null,
      remarks: blank(values.remarks),
    }
    if (mode === "create") {
      const saved = await create.mutateAsync({
        salesId: salesId!,
        // Untouched: the server applies the same default, avoiding a race on the suffix.
        ...(values.number === null ? {} : { customerInvoiceNumber: number.trim() }),
        ...fields,
        sellingIds: selectedIds,
      })
      onSaved?.(saved)
    } else {
      const changes: CustomerInvoiceUpdate = { ...fields }
      if (number.trim() !== invoice!.customerInvoiceNumber) changes.customerInvoiceNumber = number.trim()
      if (values.sellingIds !== null && !linesLocked) changes.sellingIds = selectedIds
      const saved = await update.mutateAsync({ id: invoice!.id, invoice: changes })
      onSaved?.(saved)
    }
    setOpen(false)
  }

  const title = mode === "create" ? "New customer invoice" : `Edit ${invoice?.customerInvoiceNumber}`

  const preview = (
    <section aria-label="Invoice preview" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">Live preview</h3>
          <p className="text-xs text-muted-foreground">Updates as you edit. Print it once the invoice is saved.</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
          Letterhead
          <Switch checked={letterhead} onCheckedChange={setLetterhead} aria-label="Show letterhead" />
        </label>
      </div>
      {previewInvoice ? (
        previewLines.length ? (
          <ScaledPage>
            <InvoicePrintSheet
              invoice={previewInvoice}
              lines={previewLines}
              billTo={invoiceBillTo(billedCustomer, customerQuery.data)}
              letterhead={letterhead}
            />
          </ScaledPage>
        ) : (
          <p className="rounded-xl bg-card px-3 py-10 text-center text-sm text-muted-foreground">
            Tick at least one selling to see the invoice.
          </p>
        )
      ) : (
        <p className="rounded-xl bg-card px-3 py-10 text-center text-sm text-muted-foreground">
          {salesId ? "Loading…" : "Choose a sales job to see the invoice."}
        </p>
      )}
    </section>
  )

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (pending) return
        setOpen(next)
        if (next) {
          setValues(initialState(fixedSalesId, invoice))
          setErrors({})
          setMobileView("form")
        }
      }}
    >
      <SheetTrigger asChild>
        {trigger ?? (
          <Button>
            <IconPlus className="size-4" />
            New invoice
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" hideClose className="w-full gap-0 p-0 sm:max-w-[min(96vw,1320px)]">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            void submit()
          }}
          className="flex h-full min-h-0 flex-col"
        >
          <SheetHeader className="flex-row items-start gap-3 border-b border-border px-5 py-4 sm:px-6">
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-lg">{title}</SheetTitle>
              <SheetDescription className="hidden sm:block">
                Bill the customer for sellings in {sales ? sales.salesNumber : "a sales job"}. The amount comes from the
                sellings you tick.
              </SheetDescription>
            </div>
            <div role="tablist" aria-label="View" className="flex rounded-full bg-muted p-1 lg:hidden">
              {(
                [
                  { value: "form", label: "Form", icon: IconPencil },
                  { value: "preview", label: "Preview", icon: IconEye },
                ] as const
              ).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={mobileView === value}
                  onClick={() => setMobileView(value)}
                  className={cn(
                    "flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors",
                    mobileView === value ? "brand-fill" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              <IconX />
            </Button>
          </SheetHeader>

          <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]">
            <div
              className={cn(
                "min-h-0 space-y-5 overflow-y-auto px-5 py-5 sm:px-6",
                mobileView === "preview" && "hidden lg:block"
              )}
            >
              {pickSales ? (
                <SearchableCombobox
                  label="Sales job"
                  required
                  items={salesItems}
                  value={values.salesId}
                  onValueChange={(value) => {
                    setErrors((current) => ({ ...current, sales: undefined }))
                    setValues((current) => ({ ...current, salesId: value || NONE, number: null, sellingIds: null }))
                  }}
                  onSearchTermChange={setSalesSearch}
                  placeholder="Search sales number or customer"
                  emptyMessage="No sales jobs found"
                  isLoading={salesOptions.isLoading}
                  isSearching={salesOptions.isFetching}
                  error={errors.sales}
                />
              ) : null}

              <fieldset className="min-w-0">
                <legend className="mb-2 text-sm font-medium text-foreground">Type</legend>
                <div role="radiogroup" aria-label="Invoice type" className="grid gap-2 sm:grid-cols-2">
                  {TYPE_OPTIONS.map((option) => {
                    const active = values.type === option.value
                    const Icon = option.icon
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => set("type", option.value)}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                          active ? "border-primary bg-secondary" : "border-border hover:border-input hover:bg-muted/60"
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-full",
                            active ? "brand-fill" : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-foreground">{option.title}</span>
                          <span className="block text-xs text-muted-foreground">{option.body}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <div className="rounded-xl surface-inset p-3.5">
                <label htmlFor="invoice-number" className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <IconHash className="size-4 text-muted-foreground" />
                  Invoice number <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    id="invoice-number"
                    value={number}
                    onChange={(event) => {
                      setErrors((current) => ({ ...current, number: undefined }))
                      set("number", event.target.value)
                    }}
                    placeholder={salesId ? "Loading…" : "Choose a sales job first"}
                    aria-invalid={Boolean(errors.number) || undefined}
                    className="h-11 w-full rounded-lg border border-input bg-card px-3.5 font-mono text-[15px] font-semibold text-foreground placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-muted-foreground shadow-[inset_0_1px_2px_rgba(var(--mli-ink-rgb),0.06)] outline-none transition-[border-color,box-shadow] focus:border-ring focus:ring-[3px] focus:ring-ring/15 aria-invalid:border-destructive"
                  />
                  {mode === "create" && suggestion.isFetching && values.number === null ? (
                    <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  ) : null}
                </div>
                {errors.number ? <p className="mt-1.5 text-xs text-destructive">{errors.number}</p> : null}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {!sales ? (
                    <span>Follows the sales number by default. You can change it.</span>
                  ) : followsSales ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--mli-success-container)] px-2 py-0.5 font-medium text-[var(--mli-on-success-container)]">
                      <IconCheck className="size-3" />
                      Same as the sales number
                    </span>
                  ) : (
                    <>
                      <span>
                        {values.number === null && suggested
                          ? `The sales number already has a ${values.type === "INVOICE" ? "invoice" : "reimbursement"}, so this one gets a suffix.`
                          : `Sales number: ${sales.salesNumber}`}
                      </span>
                      {values.number !== null ? (
                        <button
                          type="button"
                          onClick={() => set("number", mode === "create" ? null : sales.salesNumber)}
                          className="inline-flex cursor-pointer items-center gap-1 font-medium text-primary hover:underline"
                        >
                          <IconRestore className="size-3.5" />
                          {mode === "create" ? "Use the default" : "Use the sales number"}
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
              </div>

              <fieldset className="min-w-0">
                <legend className="mb-2 flex w-full items-center justify-between gap-2 text-sm font-medium text-foreground">
                  <span>
                    Sellings to bill <span className="text-destructive">*</span>
                  </span>
                  {billable.length > 1 && !linesLocked ? (
                    <button
                      type="button"
                      onClick={() => set("sellingIds", selectedIds.length === billable.length ? [] : billable.map((line) => line.id))}
                      className="cursor-pointer text-xs font-medium text-primary hover:underline"
                    >
                      {selectedIds.length === billable.length ? "Clear all" : "Select all"}
                    </button>
                  ) : null}
                </legend>
                {linesLocked ? (
                  <p className="mb-2 flex items-center gap-2 rounded-lg bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
                    <IconLock className="size-3.5 shrink-0" />
                    This invoice is paid, so its sellings are locked. Mark it unpaid to change them.
                  </p>
                ) : null}
                <div role="group" aria-label="Sellings to bill" className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                  {!salesId ? (
                    <p className="rounded-xl bg-muted/70 px-3 py-5 text-center text-sm text-muted-foreground">
                      Choose a sales job to see its sellings.
                    </p>
                  ) : salesQuery.isLoading ? (
                    <p className="py-5 text-center text-sm text-muted-foreground">Loading…</p>
                  ) : billable.length === 0 ? (
                    <p className="rounded-xl bg-muted/70 px-3 py-5 text-center text-sm text-muted-foreground">
                      {sellings.length ? "Every selling in this job is already billed." : "This job has no sellings yet. Add them first."}
                    </p>
                  ) : (
                    billable.map((line) => {
                      const checked = selected.has(line.id)
                      return (
                        <button
                          key={line.id}
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          disabled={linesLocked}
                          onClick={() => toggleLine(line.id)}
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-3 rounded-xl border p-2.5 text-left transition-colors disabled:cursor-default disabled:opacity-70",
                            checked ? "border-primary bg-secondary" : "border-border hover:border-input hover:bg-muted/60"
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded-md border",
                              checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card"
                            )}
                          >
                            {checked ? <IconCheck className="size-3.5" /> : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-foreground">{line.sellingDescription}</span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {Number(line.quantity).toLocaleString("id-ID")} × {formatIdr(Number(line.price) * Number(line.currencyPrice))}
                              {Number(line.vatPercentage) ? ` · VAT ${Number(line.vatPercentage)}%` : ""}
                              {Number(line.pph23Percentage) ? ` · PPh 23 ${Number(line.pph23Percentage)}%` : ""}
                            </span>
                          </span>
                          <span className="shrink-0 text-sm font-medium tabular-nums">{formatIdr(vendorInvoiceLineGross(line))}</span>
                        </button>
                      )
                    })
                  )}
                </div>
                {errors.sellings ? <p className="mt-1.5 text-xs text-destructive">{errors.sellings}</p> : null}
                {billedElsewhere.length ? (
                  <p className="mt-2 px-1 text-xs text-muted-foreground">
                    {billedElsewhere.length} other selling{billedElsewhere.length === 1 ? " is" : "s are"} already on{" "}
                    {[...new Set(billedElsewhere.map((line) => line.customerInvoice!.customerInvoiceNumber))].join(", ")}.
                  </p>
                ) : null}
              </fieldset>

              {selectedIds.length > 0 && billable.length > 0 ? (
                <dl className="space-y-1.5 rounded-xl surface-inset p-3.5 text-sm" aria-live="polite">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="tabular-nums">{formatIdr(totals.subtotal)}</dd>
                  </div>
                  {totals.vat ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">VAT</dt>
                      <dd className="tabular-nums">+ {formatIdr(totals.vat)}</dd>
                    </div>
                  ) : null}
                  {totals.pph23 ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">PPh 23 withheld</dt>
                      <dd className="tabular-nums">− {formatIdr(totals.pph23)}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-3 border-t border-border pt-2 text-base font-semibold">
                    <dt>Amount due</dt>
                    <dd className="tabular-nums">{formatIdr(totals.due)}</dd>
                  </div>
                </dl>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <DatePicker
                  id="invoice-date"
                  label="Invoice date"
                  value={values.invoiceDate}
                  onValueChange={(value) => set("invoiceDate", value)}
                />
                <div className="hidden sm:block" />
                <TextField
                  label="Tax invoice number"
                  name="taxInvoice"
                  value={values.taxInvoice}
                  onChange={(event) => set("taxInvoice", event.target.value)}
                  placeholder="Faktur pajak, optional"
                />
                <DatePicker
                  id="tax-invoice-date"
                  label="Tax invoice date"
                  value={values.taxInvoiceDate}
                  onValueChange={(value) => set("taxInvoiceDate", value)}
                />
              </div>

              <fieldset className="space-y-3">
                <legend className="mb-2 text-sm font-medium text-foreground">Payment</legend>
                <div role="radiogroup" aria-label="Payment status" className="inline-flex rounded-full bg-muted p-1">
                  {STATUS_OPTIONS.map((option) => {
                    const active = values.status === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() =>
                          setValues((current) => ({
                            ...current,
                            status: option.value,
                            paymentDate: option.value === "PAID" ? current.paymentDate || todayDateOnly() : "",
                          }))
                        }
                        className={cn(
                          "h-8 cursor-pointer rounded-full px-4 text-[13px] font-medium transition-colors",
                          active ? "brand-fill" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
                {values.status === "PAID" ? (
                  <DatePicker
                    id="payment-date"
                    label="Payment date"
                    value={values.paymentDate}
                    onValueChange={(value) => set("paymentDate", value)}
                    className="sm:max-w-[calc(50%-0.5rem)]"
                  />
                ) : null}
              </fieldset>

              <TextField
                label="Remarks"
                name="remarks"
                multiline
                value={values.remarks}
                onChange={(event) => set("remarks", event.target.value)}
                placeholder="Payment terms or notes for the customer, optional"
              />
            </div>

            <div
              className={cn(
                "min-h-0 overflow-y-auto bg-muted/60 px-4 py-5 sm:px-6 lg:border-l lg:border-border",
                mobileView === "form" && "hidden lg:block"
              )}
            >
              {preview}
            </div>
          </div>

          <SheetFooter className="mt-0 flex-row items-center justify-end gap-2 border-t border-border px-5 py-3 sm:px-6">
            {mode === "edit" && invoice ? (
              <Button asChild type="button" variant="ghost" className="mr-auto">
                <Link href={`/dashboard/customer-invoices/${invoice.id}/print`}>
                  <IconPrinter className="size-4" />
                  Print saved invoice
                </Link>
              </Button>
            ) : null}
            <Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : mode === "create" ? "Create invoice" : "Save changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

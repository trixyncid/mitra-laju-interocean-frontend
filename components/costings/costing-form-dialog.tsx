"use client"

import { useState, type ReactNode } from "react"
import { IconFileInvoice, IconLink, IconPencil, IconPlus } from "@tabler/icons-react"

import { SourceLinePicker, type SourceLine } from "@/components/costings/source-line-picker"
import {
  choiceAmounts,
  choiceDescription,
  choiceVendorName,
  validateLineChoice,
  VendorInvoiceLookup,
  type LineChoice,
  type LineDraft,
} from "@/components/costings/vendor-invoice-lookup"
import { formatIdr } from "@/components/dashboard/overview-card"
import { SearchableCombobox } from "@/components/searchable-combobox"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { NumberField } from "@/components/ui/number-field"
import { TextField } from "@/components/ui/text-field"
import { useCreateCosting, useSalesOptions, useUpdateCosting } from "@/hooks/use-costings"
import { useVendorSearch } from "@/hooks/use-entity-searches"
import { usePermissions } from "@/hooks/use-permissions"
import type { Costing, CostingInput, CostingSource } from "@/lib/types/costing"
import {
  cn,
  vendorInvoiceInvoiceLineNet,
  vendorInvoiceLineGross,
  vendorInvoiceLinePph23Amount,
  vendorInvoiceLineVatAmount,
} from "@/lib/utils"

type FormState = {
  source: CostingSource
  /** The vendor invoice line (existing or to be created) for VENDOR_INVOICE costings. */
  choice: LineChoice | null
  lineTab: "lookup" | "browse"
  costingDescription: string
  vendorId: string
  salesId: string
  quantity: number | ""
  price: number | ""
  currencyPrice: number | ""
  vatPercentage: number | ""
  pph23Percentage: number | ""
}

type Errors = Partial<Record<string, string>>

const NO_SALES = "-"

const SOURCES: { value: CostingSource; label: string; hint: string; icon: typeof IconPencil }[] = [
  {
    value: "VENDOR_INVOICE",
    label: "From vendor invoice",
    hint: "Pick a line; amounts are copied and kept in sync",
    icon: IconFileInvoice,
  },
  { value: "MANUAL", label: "Manual input", hint: "Type in every amount yourself", icon: IconPencil },
]

/** A VENDOR_INVOICE costing's own line, shaped for the picker. */
function currentSourceLine(costing?: Costing): SourceLine | null {
  if (costing?.costingSource !== "VENDOR_INVOICE") return null
  const line = costing.vendorInvoiceBreakdowns[0]
  if (!line) return null
  return { ...line, vendorInvoice: { ...line.vendorInvoice, vendor: costing.vendor } }
}

function initialState(costing?: Costing, defaultSalesId?: string, defaultDescription = ""): FormState {
  return {
    source: costing?.costingSource ?? "VENDOR_INVOICE",
    choice: (() => {
      const line = currentSourceLine(costing)
      return line ? { kind: "existing" as const, line } : null
    })(),
    lineTab: "lookup",
    costingDescription: costing?.costingDescription ?? defaultDescription,
    vendorId: costing?.vendorId ?? "",
    salesId: costing?.salesId ?? defaultSalesId ?? NO_SALES,
    quantity: costing ? Number(costing.quantity) : 1,
    price: costing ? Number(costing.price) : "",
    currencyPrice: costing ? Number(costing.currencyPrice) : 1,
    vatPercentage: costing ? Number(costing.vatPercentage) : 0,
    pph23Percentage: costing ? Number(costing.pph23Percentage) : 0,
  }
}

function validate(values: FormState): Errors {
  const errors: Errors = {}
  if (values.source === "VENDOR_INVOICE") return validateLineChoice(values.choice)
  if (!values.costingDescription.trim()) errors.costingDescription = "Description is required"
  if (!values.vendorId || values.vendorId === "-") errors.vendorId = "Vendor is required"
  if (values.quantity === "" || values.quantity < 1 || !Number.isInteger(values.quantity))
    errors.quantity = "Whole number, at least 1"
  if (values.price === "" || values.price < 0) errors.price = "Enter a price of 0 or more"
  if (values.currencyPrice === "" || values.currencyPrice <= 0) errors.currencyPrice = "Must be greater than 0"
  if (values.vatPercentage === "" || values.vatPercentage < 0 || values.vatPercentage > 100)
    errors.vatPercentage = "Between 0 and 100"
  if (values.pph23Percentage === "" || values.pph23Percentage < 0 || values.pph23Percentage > 100)
    errors.pph23Percentage = "Between 0 and 100"
  return errors
}

function draftToBreakdown(line: LineDraft) {
  return {
    productDescription: line.productDescription.trim(),
    quantity: Number(line.quantity),
    price: Number(line.price),
    currencyPrice: Number(line.currencyPrice),
    vatPercentage: Number(line.vatPercentage),
    pph23Percentage: Number(line.pph23Percentage),
    ...(line.containerNumber.trim() ? { containerNumber: line.containerNumber.trim() } : {}),
  }
}

function toPayload(values: FormState): CostingInput {
  const salesId = values.salesId === NO_SALES ? null : values.salesId
  if (values.source === "VENDOR_INVOICE") {
    const choice = values.choice!
    const base = { source: "VENDOR_INVOICE" as const, costingDescription: values.costingDescription.trim() || null, salesId }
    if (choice.kind === "existing") return { ...base, breakdownId: choice.line.id }
    if (choice.kind === "newLine") {
      return { ...base, newLine: { vendorInvoiceId: choice.invoice.id, breakdown: draftToBreakdown(choice.line) } }
    }
    return {
      ...base,
      newLine: {
        vendorInvoice: {
          vendorId: choice.header.vendorId,
          vendorInvoiceNumber: choice.header.vendorInvoiceNumber.trim(),
          vendorInvoiceType: choice.header.vendorInvoiceType,
          ...(choice.header.vendorInvoiceDate ? { vendorInvoiceDate: choice.header.vendorInvoiceDate } : {}),
          ...(choice.header.vendorVessel.trim() ? { vendorVessel: choice.header.vendorVessel.trim() } : {}),
        },
        breakdown: draftToBreakdown(choice.line),
      },
    }
  }
  return {
    source: "MANUAL",
    costingDescription: values.costingDescription.trim(),
    vendorId: values.vendorId,
    salesId,
    quantity: Number(values.quantity),
    price: Number(values.price),
    currencyPrice: Number(values.currencyPrice),
    vatPercentage: Number(values.vatPercentage),
    pph23Percentage: Number(values.pph23Percentage),
  }
}

function number(value: number | string | null | undefined, digits = 2) {
  return Number(value ?? 0).toLocaleString("id-ID", { maximumFractionDigits: digits })
}

export function CostingFormDialog({
  mode,
  costing,
  defaultSalesId,
  defaultSalesLabel,
  trigger,
  onSaved,
  defaultOpen = false,
  onOpenChange,
  defaultDescription,
  pendingSalesJob,
}: {
  mode: "create" | "edit"
  costing?: Costing
  /** Prefills the description, e.g. with what was searched for. */
  defaultDescription?: string
  /** The job isn't saved yet: show this instead of the sales job picker and leave it unset. */
  pendingSalesJob?: string
  defaultSalesId?: string
  /** Shown for `defaultSalesId` when it isn't among the recent sales options. */
  defaultSalesLabel?: string
  trigger?: ReactNode
  onSaved?: (costing: Costing) => void
  /** Open on mount, e.g. when arriving from a "new costing" link. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpenState] = useState(defaultOpen)
  const setOpen = (next: boolean) => {
    setOpenState(next)
    onOpenChange?.(next)
  }
  const [values, setValues] = useState<FormState>(() => initialState(costing, defaultSalesId, defaultDescription))
  const [errors, setErrors] = useState<Errors>({})
  const [vendorSearch, setVendorSearch] = useState("")
  const [salesSearch, setSalesSearch] = useState("")
  const createCosting = useCreateCosting()
  const updateCosting = useUpdateCosting()
  const pending = createCosting.isPending || updateCosting.isPending
  const manual = values.source === "MANUAL"
  const { can } = usePermissions()
  // New invoices/lines can only be created together with a new costing.
  const canCreateInvoice = mode === "create" && can("VENDOR_INVOICE", "create")
  const canAddLine = mode === "create" && can("VENDOR_INVOICE", "edit")

  const vendorsQuery = useVendorSearch(vendorSearch, open && manual, "true")
  const salesQuery = useSalesOptions(salesSearch, open && !pendingSalesJob)

  const vendorItems = (() => {
    const items =
      vendorsQuery.data?.items
        ?.filter((vendor) => vendor.id)
        .map((vendor) => ({
          value: vendor.id as string,
          label: vendor.vendorCode ? `${vendor.vendorName} (${vendor.vendorCode})` : vendor.vendorName,
        })) ?? []
    // Keep the current vendor selectable even when it isn't in the first search page.
    if (costing?.vendor && !items.some((item) => item.value === costing.vendor.id)) {
      items.unshift({
        value: costing.vendor.id,
        label: costing.vendor.vendorCode
          ? `${costing.vendor.vendorName} (${costing.vendor.vendorCode})`
          : costing.vendor.vendorName,
      })
    }
    return items
  })()

  const salesItems = (() => {
    const items = [
      { value: NO_SALES, label: "No sales job" },
      ...(salesQuery.data ?? []).map((sales) => ({
        value: sales.id,
        label: sales.customer ? `${sales.salesNumber} · ${sales.customer.customerName}` : sales.salesNumber,
      })),
    ]
    if (costing?.sales && !items.some((item) => item.value === costing.sales!.id)) {
      items.splice(1, 0, { value: costing.sales.id, label: costing.sales.salesNumber })
    }
    if (defaultSalesId && !items.some((item) => item.value === defaultSalesId)) {
      items.splice(1, 0, { value: defaultSalesId, label: defaultSalesLabel ?? "This sales job" })
    }
    return items
  })()

  // Amounts behind the live preview: the chosen line, or what's been typed in.
  const amounts = manual
    ? {
        quantity: values.quantity || 0,
        price: values.price || 0,
        currencyPrice: values.currencyPrice || 0,
        vatPercentage: values.vatPercentage || 0,
        pph23Percentage: values.pph23Percentage || 0,
      }
    : choiceAmounts(values.choice)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const reset = () => {
    setValues(initialState(costing, defaultSalesId, defaultDescription))
    setErrors({})
  }

  const submit = async (addAnother: boolean) => {
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    const payload = toPayload(values)
    const saved =
      mode === "create"
        ? await createCosting.mutateAsync(payload)
        : await updateCosting.mutateAsync({ id: costing!.id, costing: payload })
    onSaved?.(saved)

    if (addAnother) {
      // Keep the source, sales job (and for manual entry vendor and taxes): consecutive lines usually share them.
      setValues((current) => ({ ...current, choice: null, costingDescription: "", price: "", quantity: 1 }))
      setErrors({})
    } else {
      setOpen(false)
    }
  }

  const switchingToManual = mode === "edit" && costing?.costingSource === "VENDOR_INVOICE" && manual

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return
        setOpen(next)
        if (next) reset()
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <IconPlus className="size-4" />
            New costing
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New costing line" : "Edit costing line"}</DialogTitle>
          <DialogDescription>
            Take the cost straight from a vendor invoice line, or enter it manually.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            void submit(false)
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div role="radiogroup" aria-label="Costing source" className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
            {SOURCES.map(({ value, label, hint, icon: Icon }) => {
              const active = values.source === value
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    set("source", value)
                    setErrors({})
                  }}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                    active ? "border-primary bg-secondary" : "border-border hover:border-input hover:bg-muted/60"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full",
                      active ? "brand-fill" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">{label}</span>
                    <span className="block text-xs text-muted-foreground">{hint}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {manual ? null : (
            <div className="space-y-2 sm:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  Vendor invoice line <span className="text-[var(--mli-on-error-container)]">*</span>
                </p>
                <div role="tablist" aria-label="How to find the line" className="flex h-8 items-center rounded-full bg-muted p-0.5">
                  {(
                    [
                      ["lookup", "Find by invoice number"],
                      ["browse", "Browse unmatched lines"],
                    ] as const
                  ).map(([tab, label]) => (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={values.lineTab === tab}
                      onClick={() => set("lineTab", tab)}
                      className={cn(
                        "h-full cursor-pointer rounded-full px-3 text-xs font-medium transition-colors",
                        values.lineTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {values.lineTab === "lookup" ? (
                <VendorInvoiceLookup
                  choice={values.choice}
                  onChange={(choice) => {
                    setValues((current) => ({ ...current, choice }))
                    setErrors({})
                  }}
                  errors={errors}
                  enabled={open && !manual}
                  canCreateInvoice={canCreateInvoice}
                  canAddLine={canAddLine}
                />
              ) : (
                <SourceLinePicker
                  value={values.choice?.kind === "existing" ? values.choice.line : null}
                  onChange={(line) => {
                    setValues((current) => ({ ...current, choice: { kind: "existing", line } }))
                    setErrors({})
                  }}
                  enabled={open && !manual}
                  error={errors.choice}
                />
              )}
            </div>
          )}

          <div className="sm:col-span-2">
            <TextField
              label={manual ? "Description" : "Description (optional)"}
              required={manual}
              id="costingDescription"
              placeholder={
                manual
                  ? "e.g. Trucking Tanjung Priok → warehouse"
                  : choiceDescription(values.choice) ?? "Defaults to the vendor invoice line's description"
              }
              value={values.costingDescription}
              onChange={(event) => set("costingDescription", event.target.value)}
              error={errors.costingDescription}
            />
          </div>

          {manual ? (
            <SearchableCombobox
              label="Vendor"
              required
              items={vendorItems}
              value={values.vendorId}
              onValueChange={(value) => set("vendorId", value)}
              onSearchTermChange={setVendorSearch}
              placeholder="Search vendor"
              emptyMessage="No vendors found"
              isLoading={vendorsQuery.isLoading}
              isSearching={vendorsQuery.isFetching}
              error={errors.vendorId}
            />
          ) : (
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">Vendor</p>
              <p className="flex h-10 items-center rounded-full bg-muted px-5 text-sm text-foreground">
                {choiceVendorName(values.choice) ?? (
                  <span className="text-muted-foreground">From the vendor invoice</span>
                )}
              </p>
            </div>
          )}
          {pendingSalesJob ? (
            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">Sales job</p>
              <p className="flex h-10 items-center gap-2 rounded-full bg-muted px-5 text-sm text-foreground">
                <IconLink className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{pendingSalesJob}</span>
              </p>
            </div>
          ) : (
          <SearchableCombobox
            label="Sales job"
            description="Optional — group this cost under a job."
            items={salesItems}
            value={values.salesId}
            onValueChange={(value) => set("salesId", value || NO_SALES)}
            onSearchTermChange={setSalesSearch}
            placeholder="Search sales number"
            emptyMessage="No sales jobs found"
            isLoading={salesQuery.isLoading}
            isSearching={salesQuery.isFetching}
          />
          )}

          {manual ? (
            <>
              <NumberField
                label="Quantity"
                required
                id="quantity"
                value={values.quantity}
                onValueChange={(value) => set("quantity", value)}
                maximumFractionDigits={0}
                error={errors.quantity}
              />
              <NumberField
                label="Unit price"
                required
                id="price"
                placeholder="0"
                value={values.price}
                onValueChange={(value) => set("price", value)}
                error={errors.price}
              />
              <NumberField
                label="Exchange rate"
                required
                id="currencyPrice"
                description="Use 1 for IDR prices."
                value={values.currencyPrice}
                onValueChange={(value) => set("currencyPrice", value)}
                error={errors.currencyPrice}
              />
              <div className="grid grid-cols-2 gap-4">
                <NumberField
                  label="VAT %"
                  id="vatPercentage"
                  value={values.vatPercentage}
                  onValueChange={(value) => set("vatPercentage", value)}
                  error={errors.vatPercentage}
                />
                <NumberField
                  label="PPH 23 %"
                  id="pph23Percentage"
                  value={values.pph23Percentage}
                  onValueChange={(value) => set("pph23Percentage", value)}
                  error={errors.pph23Percentage}
                />
              </div>
            </>
          ) : values.choice?.kind === "existing" ? (
            <p className="text-sm text-muted-foreground sm:col-span-2">
              <span className="tabular-nums text-foreground">{number(values.choice.line.quantity, 0)}</span> ×{" "}
              <span className="tabular-nums text-foreground">{number(values.choice.line.price)}</span>
              {Number(values.choice.line.currencyPrice) !== 1 ? (
                <>
                  {" "}× <span className="tabular-nums text-foreground">{number(values.choice.line.currencyPrice)}</span> rate
                </>
              ) : null}
              {` · VAT ${number(values.choice.line.vatPercentage)}% · PPH 23 ${number(values.choice.line.pph23Percentage)}%`}
              <span className="block text-xs">Copied from the vendor invoice line and kept in sync if it changes.</span>
            </p>
          ) : values.choice ? (
            <p className="text-xs text-muted-foreground sm:col-span-2">
              {values.choice.kind === "newInvoice"
                ? "On save, the vendor invoice and its line are created first, then this costing follows the line."
                : `On save, the line is added to ${values.choice.invoice.vendorInvoiceNumber} and this costing follows it.`}
            </p>
          ) : null}

          {switchingToManual ? (
            <p className="rounded-xl bg-[var(--mli-warning-container)] px-4 py-3 text-xs text-[var(--mli-on-warning-container)] sm:col-span-2">
              Switching to manual keeps the current amounts but stops following the vendor invoice line. The line stays
              matched as what was billed.
            </p>
          ) : null}

          <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 rounded-xl bg-muted/70 p-4 text-sm sm:col-span-2 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">Gross</dt>
              <dd className="font-medium tabular-nums">{formatIdr(vendorInvoiceLineGross(amounts))}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">VAT</dt>
              <dd className="font-medium tabular-nums">+ {formatIdr(vendorInvoiceLineVatAmount(amounts))}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">PPH 23</dt>
              <dd className="font-medium tabular-nums">− {formatIdr(vendorInvoiceLinePph23Amount(amounts))}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Net cost</dt>
              <dd className="font-semibold tabular-nums text-foreground">{formatIdr(vendorInvoiceInvoiceLineNet(amounts))}</dd>
            </div>
          </dl>

          <DialogFooter className="gap-2 sm:col-span-2">
            <Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {mode === "create" ? (
              <Button type="button" variant="secondary" disabled={pending} onClick={() => void submit(true)}>
                Save & add another
              </Button>
            ) : null}
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : mode === "create" ? "Save line" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

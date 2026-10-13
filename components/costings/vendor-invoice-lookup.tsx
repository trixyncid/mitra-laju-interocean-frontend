"use client"

import { useState } from "react"
import { IconCheck, IconChevronLeft, IconFilePlus, IconPlus, IconReceipt, IconSearch } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"

import type { SourceLine } from "@/components/costings/source-line-picker"
import { formatIdr } from "@/components/dashboard/overview-card"
import { SearchableCombobox } from "@/components/searchable-combobox"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { NumberField } from "@/components/ui/number-field"
import { TextField } from "@/components/ui/text-field"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useVendorSearch } from "@/hooks/use-entity-searches"
import { useVendorInvoiceById, useVendorInvoices } from "@/hooks/use-vendor-invoices"
import { cn, localDate, vendorInvoiceInvoiceLineNet } from "@/lib/utils"

export type LineDraft = {
  productDescription: string
  quantity: number | ""
  price: number | ""
  currencyPrice: number | ""
  vatPercentage: number | ""
  pph23Percentage: number | ""
  containerNumber: string
}

export type HeaderDraft = {
  vendorId: string
  vendorLabel: string
  vendorInvoiceNumber: string
  vendorInvoiceType: "INVOICE" | "REIMBURSEMENT"
  vendorInvoiceDate: string
  vendorVessel: string
}

type InvoiceRef = { id: string; vendorInvoiceNumber: string; vendorName: string }

/** What the user settled on: an existing line, a new line on an invoice, or a new invoice. */
export type LineChoice =
  | { kind: "existing"; line: SourceLine }
  | { kind: "newLine"; invoice: InvoiceRef; line: LineDraft }
  | { kind: "newInvoice"; header: HeaderDraft; line: LineDraft }

export type LineChoiceErrors = Partial<Record<string, string>>

const EMPTY_LINE: LineDraft = {
  productDescription: "",
  quantity: 1,
  price: "",
  currencyPrice: 1,
  vatPercentage: 0,
  pph23Percentage: 0,
  containerNumber: "",
}

export function validateLineChoice(choice: LineChoice | null): LineChoiceErrors {
  if (!choice) return { choice: "Find the vendor invoice and pick or add a line" }
  if (choice.kind === "existing") return {}
  const errors: LineChoiceErrors = {}
  const line = choice.line
  if (!line.productDescription.trim()) errors.productDescription = "Line description is required"
  if (line.quantity === "" || line.quantity < 1 || !Number.isInteger(line.quantity)) errors.quantity = "Whole number, at least 1"
  if (line.price === "") errors.price = "Enter the line price"
  if (line.currencyPrice === "" || line.currencyPrice <= 0) errors.currencyPrice = "Must be greater than 0"
  if (line.vatPercentage === "" || line.vatPercentage < 0 || line.vatPercentage > 100) errors.vatPercentage = "0–100"
  if (line.pph23Percentage === "" || line.pph23Percentage < 0 || line.pph23Percentage > 100) errors.pph23Percentage = "0–100"
  if (choice.kind === "newInvoice") {
    if (!choice.header.vendorId || choice.header.vendorId === "-") errors.vendorId = "Vendor is required"
    if (!choice.header.vendorInvoiceNumber.trim()) errors.vendorInvoiceNumber = "Invoice number is required"
  }
  return errors
}

/** Numbers the live preview and payload use, whatever kind of choice it is. */
export function choiceAmounts(choice: LineChoice | null) {
  if (!choice) return { quantity: 0, price: 0, currencyPrice: 0, vatPercentage: 0, pph23Percentage: 0 }
  if (choice.kind === "existing") return choice.line
  const line = choice.line
  return {
    quantity: line.quantity || 0,
    price: line.price || 0,
    currencyPrice: line.currencyPrice || 0,
    vatPercentage: line.vatPercentage || 0,
    pph23Percentage: line.pph23Percentage || 0,
  }
}

export function choiceVendorName(choice: LineChoice | null) {
  if (!choice) return null
  if (choice.kind === "existing") return choice.line.vendorInvoice.vendor?.vendorName ?? null
  if (choice.kind === "newLine") return choice.invoice.vendorName
  return choice.header.vendorLabel || null
}

export function choiceDescription(choice: LineChoice | null) {
  if (!choice) return null
  return choice.kind === "existing" ? choice.line.productDescription : choice.line.productDescription || null
}

function LineDraftFields({
  value,
  onChange,
  errors,
}: {
  value: LineDraft
  onChange: (next: LineDraft) => void
  errors: LineChoiceErrors
}) {
  const set = <K extends keyof LineDraft>(key: K, next: LineDraft[K]) => onChange({ ...value, [key]: next })
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <TextField
          label="Line description"
          required
          id="newLineDescription"
          placeholder="e.g. Terminal handling charge (THC)"
          value={value.productDescription}
          onChange={(event) => set("productDescription", event.target.value)}
          error={errors.productDescription}
        />
      </div>
      <NumberField
        label="Quantity"
        required
        id="newLineQuantity"
        value={value.quantity}
        onValueChange={(next) => set("quantity", next)}
        maximumFractionDigits={0}
        error={errors.quantity}
      />
      <NumberField
        label="Unit price"
        required
        id="newLinePrice"
        placeholder="0"
        value={value.price}
        onValueChange={(next) => set("price", next)}
        error={errors.price}
      />
      <NumberField
        label="Exchange rate"
        required
        id="newLineRate"
        description="Use 1 for IDR prices."
        value={value.currencyPrice}
        onValueChange={(next) => set("currencyPrice", next)}
        error={errors.currencyPrice}
      />
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="VAT %"
          id="newLineVat"
          value={value.vatPercentage}
          onValueChange={(next) => set("vatPercentage", next)}
          error={errors.vatPercentage}
        />
        <NumberField
          label="PPH 23 %"
          id="newLinePph"
          value={value.pph23Percentage}
          onValueChange={(next) => set("pph23Percentage", next)}
          error={errors.pph23Percentage}
        />
      </div>
      <div className="sm:col-span-2">
        <TextField
          label="Container number (optional)"
          id="newLineContainer"
          placeholder="e.g. MRTU4410021"
          value={value.containerNumber}
          onChange={(event) => set("containerNumber", event.target.value)}
        />
      </div>
    </div>
  )
}

function NewInvoiceFields({
  value,
  onChange,
  errors,
  enabled,
}: {
  value: HeaderDraft
  onChange: (next: HeaderDraft) => void
  errors: LineChoiceErrors
  enabled: boolean
}) {
  const [vendorSearch, setVendorSearch] = useState("")
  const vendors = useVendorSearch(vendorSearch, enabled, "true")
  const items =
    vendors.data?.items
      ?.filter((vendor) => vendor.id)
      .map((vendor) => ({
        value: vendor.id as string,
        label: vendor.vendorCode ? `${vendor.vendorName} (${vendor.vendorCode})` : vendor.vendorName,
      })) ?? []
  if (value.vendorId && !items.some((item) => item.value === value.vendorId)) {
    items.unshift({ value: value.vendorId, label: value.vendorLabel })
  }
  const set = <K extends keyof HeaderDraft>(key: K, next: HeaderDraft[K]) => onChange({ ...value, [key]: next })

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <TextField
        label="Vendor invoice number"
        required
        id="newInvoiceNumber"
        value={value.vendorInvoiceNumber}
        onChange={(event) => set("vendorInvoiceNumber", event.target.value)}
        error={errors.vendorInvoiceNumber}
      />
      <SearchableCombobox
        label="Vendor"
        required
        items={items}
        value={value.vendorId}
        onValueChange={(next) =>
          onChange({ ...value, vendorId: next, vendorLabel: items.find((item) => item.value === next)?.label ?? "" })
        }
        onSearchTermChange={setVendorSearch}
        placeholder="Search vendor"
        emptyMessage="No vendors found"
        isLoading={vendors.isLoading}
        isSearching={vendors.isFetching}
        error={errors.vendorId}
      />
      <div>
        <p className="mb-1.5 text-sm font-medium text-foreground">Document type</p>
        <div role="radiogroup" aria-label="Document type" className="flex h-10 items-center rounded-full bg-muted p-1">
          {(["INVOICE", "REIMBURSEMENT"] as const).map((type) => (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={value.vendorInvoiceType === type}
              onClick={() => set("vendorInvoiceType", type)}
              className={cn(
                "h-full flex-1 cursor-pointer rounded-full text-sm font-medium transition-colors",
                value.vendorInvoiceType === type ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {type === "INVOICE" ? "Invoice" : "Reimbursement"}
            </button>
          ))}
        </div>
      </div>
      <DatePicker
        label="Invoice date"
        value={value.vendorInvoiceDate}
        onValueChange={(next) => set("vendorInvoiceDate", next)}
        placeholder="Pick invoice date"
        outputFormat="date-only"
      />
      <div className="sm:col-span-2">
        <TextField
          label="Vessel (optional)"
          id="newInvoiceVessel"
          value={value.vendorVessel}
          onChange={(event) => set("vendorVessel", event.target.value)}
        />
      </div>
    </div>
  )
}

/** Lines of a found invoice: pick an unmatched one, or add a new line to it. */
function InvoiceLines({
  invoiceId,
  choice,
  onChange,
  errors,
  canAddLine,
}: {
  invoiceId: string
  choice: LineChoice | null
  onChange: (choice: LineChoice) => void
  errors: LineChoiceErrors
  canAddLine: boolean
}) {
  const { data: invoice, isLoading } = useVendorInvoiceById(invoiceId)
  const [query, setQuery] = useState("")
  if (isLoading || !invoice) {
    return <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading lines…</p>
  }

  const lines = invoice.vendorInvoiceBreakdowns ?? []
  const ref: InvoiceRef = {
    id: invoice.id,
    vendorInvoiceNumber: invoice.vendorInvoiceNumber,
    vendorName: invoice.vendor?.vendorName ?? "",
  }
  const addingLine = choice?.kind === "newLine" && choice.invoice.id === invoice.id
  const term = query.trim().toLowerCase()
  const digits = term.replace(/[^\d]/g, "")
  // Match description, container details or the amount (typed with or without separators).
  const visible = term
    ? lines.filter((line) => {
        const text = [line.productDescription, line.containerNumber, line.containerSize?.name, line.containerType?.name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        const amount = String(Math.round(vendorInvoiceInvoiceLineNet(line)))
        return text.includes(term) || (digits.length >= 3 && amount.includes(digits))
      })
    : lines
  const available = lines.filter((line) => !line.costing).length

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2 px-1">
        <p className="min-w-0 truncate text-sm">
          <span className="font-mono font-medium text-foreground">{invoice.vendorInvoiceNumber}</span>
          <span className="text-muted-foreground"> · {invoice.vendor?.vendorName ?? "—"}</span>
        </p>
        <p className="shrink-0 text-xs text-muted-foreground">
          {available} of {lines.length} line{lines.length === 1 ? "" : "s"} available
        </p>
      </div>
      {lines.length > 0 ? (
        <label className="relative block">
          <span className="sr-only">Search this invoice&apos;s lines</span>
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              // Enter picks the only remaining available line instead of submitting the form.
              if (event.key !== "Enter") return
              event.preventDefault()
              const candidates = visible.filter((line) => !line.costing)
              if (candidates.length === 1) {
                const line = candidates[0]
                onChange({
                  kind: "existing",
                  line: {
                    ...line,
                    vendorInvoice: {
                      id: invoice.id,
                      vendorInvoiceNumber: invoice.vendorInvoiceNumber,
                      vendorInvoiceDate: invoice.vendorInvoiceDate,
                      status: invoice.status,
                      vendor: invoice.vendor ?? null,
                    },
                  },
                })
              }
            }}
            placeholder="Search lines by description, container or amount…"
            className="h-9 w-full rounded-full border border-border bg-card pl-10 pr-20 text-sm outline-none transition-colors placeholder:text-muted-foreground hover:border-input focus:border-input focus:ring-[3px] focus:ring-ring/10"
          />
          {term ? (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs tabular-nums text-muted-foreground">
              {visible.length} found
            </span>
          ) : null}
        </label>
      ) : null}
      <div role="radiogroup" aria-label={`Lines on ${invoice.vendorInvoiceNumber}`} className="max-h-56 space-y-2 overflow-y-auto pr-1">
        {lines.length === 0 ? (
          <p className="rounded-xl bg-muted/70 px-3 py-4 text-center text-sm text-muted-foreground">This invoice has no lines yet.</p>
        ) : visible.length === 0 ? (
          <p className="rounded-xl bg-muted/70 px-3 py-4 text-center text-sm text-muted-foreground">
            No line matches “{query.trim()}”.{canAddLine ? " Add it as a new line below." : ""}
          </p>
        ) : (
          visible.map((line) => {
            const taken = Boolean(line.costing)
            const selected = choice?.kind === "existing" && choice.line.id === line.id
            const sourceLine: SourceLine = {
              ...line,
              vendorInvoice: {
                id: invoice.id,
                vendorInvoiceNumber: invoice.vendorInvoiceNumber,
                vendorInvoiceDate: invoice.vendorInvoiceDate,
                status: invoice.status,
                vendor: invoice.vendor ?? null,
              },
            }
            return (
              <button
                key={line.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={taken}
                onClick={() => onChange({ kind: "existing", line: sourceLine })}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                  taken
                    ? "cursor-not-allowed border-dashed border-border opacity-60"
                    : selected
                      ? "cursor-pointer border-primary bg-secondary"
                      : "cursor-pointer border-border hover:border-input hover:bg-muted/60"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card"
                  )}
                >
                  {selected ? <IconCheck className="size-3.5" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">{line.productDescription}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {taken
                      ? `Already in costing${line.costing?.costingDescription ? ` “${line.costing.costingDescription}”` : ""}`
                      : line.containerNumber || "Available"}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-medium tabular-nums">{formatIdr(vendorInvoiceInvoiceLineNet(line))}</span>
              </button>
            )
          })
        )}
      </div>

      {canAddLine ? (
        addingLine ? (
          <div className="space-y-3 rounded-xl border border-primary/40 bg-secondary/40 p-3">
            <p className="text-sm font-medium text-foreground">New line on {invoice.vendorInvoiceNumber}</p>
            <LineDraftFields value={choice.line} onChange={(line) => onChange({ ...choice, line })} errors={errors} />
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                kind: "newLine",
                invoice: ref,
                // Carry over a search that found nothing as the new line's description.
                line: { ...EMPTY_LINE, productDescription: visible.length === 0 ? query.trim() : "" },
              })
            }
          >
            <IconPlus className="size-4" />
            Add a new line to this invoice
          </Button>
        )
      ) : null}
    </div>
  )
}

export function VendorInvoiceLookup({
  choice,
  onChange,
  errors,
  enabled,
  canCreateInvoice,
  canAddLine,
}: {
  choice: LineChoice | null
  onChange: (choice: LineChoice | null) => void
  errors: LineChoiceErrors
  enabled: boolean
  canCreateInvoice: boolean
  canAddLine: boolean
}) {
  const [term, setTerm] = useState("")
  const [invoiceId, setInvoiceId] = useState<string | null>(null)
  const search = useDebouncedValue(term.trim(), 300)
  const searching = search.length >= 2
  const { data, isFetching } = useVendorInvoices({ page: 1, pageSize: 8, search }, enabled && searching && !invoiceId)
  const results = searching ? data?.items ?? [] : []
  const exact = results.some((invoice) => invoice.vendorInvoiceNumber.toLowerCase() === search.toLowerCase())
  const creating = choice?.kind === "newInvoice"

  const startCreate = () =>
    onChange({
      kind: "newInvoice",
      header: {
        vendorId: "",
        vendorLabel: "",
        vendorInvoiceNumber: term.trim(),
        vendorInvoiceType: "INVOICE",
        vendorInvoiceDate: "",
        vendorVessel: "",
      },
      line: EMPTY_LINE,
    })

  if (invoiceId) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => {
            setInvoiceId(null)
            onChange(null)
          }}
          className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <IconChevronLeft className="size-4" />
          Search another invoice
        </button>
        <InvoiceLines invoiceId={invoiceId} choice={choice} onChange={onChange} errors={errors} canAddLine={canAddLine} />
        {errors.choice ? <p className="text-xs text-[var(--mli-on-error-container)]">{errors.choice}</p> : null}
      </div>
    )
  }

  if (creating) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onChange(null)}
          className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <IconChevronLeft className="size-4" />
          Back to search
        </button>
        <div className="space-y-4 rounded-xl border border-primary/40 bg-secondary/40 p-3">
          <div>
            <p className="text-sm font-medium text-foreground">1 · New vendor invoice</p>
            <p className="text-xs text-muted-foreground">The invoice is created first, then its line, then this costing — all together on save.</p>
          </div>
          <NewInvoiceFields
            value={choice.header}
            onChange={(header) => onChange({ ...choice, header })}
            errors={errors}
            enabled={enabled}
          />
          <p className="border-t border-border pt-3 text-sm font-medium text-foreground">2 · Its line</p>
          <LineDraftFields value={choice.line} onChange={(line) => onChange({ ...choice, line })} errors={errors} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="relative block">
        <span className="sr-only">Vendor invoice number</span>
        <IconSearch className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Type the vendor invoice number, e.g. INV/2026/10/0999"
          className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-10 font-mono text-sm outline-none transition-colors placeholder:font-sans placeholder:text-muted-foreground hover:border-input focus:border-input focus:ring-[3px] focus:ring-ring/10"
        />
        {isFetching ? (
          <Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </label>

      {!searching ? (
        <p className="px-1 text-xs text-muted-foreground">Type at least 2 characters to look up the vendor invoice.</p>
      ) : (
        <div className="space-y-2">
          {results.map((invoice) => {
            const lineCount = invoice._count?.vendorInvoiceBreakdowns ?? invoice.vendorInvoiceBreakdowns?.length ?? 0
            return (
              <button
                key={invoice.id}
                type="button"
                onClick={() => {
                  setInvoiceId(invoice.id)
                  onChange(null)
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:border-input hover:bg-muted/60"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <IconReceipt className="size-4 text-muted-foreground" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-sm font-medium text-foreground">{invoice.vendorInvoiceNumber}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {invoice.vendor?.vendorName ?? "—"}
                    {invoice.vendorInvoiceDate ? ` · ${localDate(invoice.vendorInvoiceDate)}` : ""}
                    {` · ${lineCount} line${lineCount === 1 ? "" : "s"}`}
                  </span>
                </span>
                <span className="text-xs font-medium text-primary">Open</span>
              </button>
            )
          })}

          {!isFetching && !exact ? (
            canCreateInvoice ? (
              <button
                type="button"
                onClick={startCreate}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed border-primary/50 p-3 text-left transition-colors hover:bg-secondary/60"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <IconFilePlus className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {results.length === 0 ? "No vendor invoice found. " : ""}Create “<span className="font-mono">{term.trim()}</span>”
                  </span>
                  <span className="block text-xs text-muted-foreground">Start from the invoice header, then add its line</span>
                </span>
              </button>
            ) : results.length === 0 ? (
              <p className="rounded-xl bg-muted/70 px-3 py-4 text-center text-sm text-muted-foreground">
                No vendor invoice found, and you don&apos;t have permission to create one.
              </p>
            ) : null
          ) : null}
        </div>
      )}
      {errors.choice ? <p className="text-xs text-[var(--mli-on-error-container)]">{errors.choice}</p> : null}
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import {
  IconBox,
  IconChevronDown,
  IconCopy,
  IconFileInvoice,
  IconListDetails,
  IconPlus,
  IconReceiptRefund,
  IconTrash,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { InvoicePaper, formatIdr, type PaperLine } from "@/components/create-flow/invoice-paper"
import { QuickAddVendorDialog } from "@/components/forms/quick-add-vendor-dialog"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { FormLabel } from "@/components/ui/form-label"
import { NumberField } from "@/components/ui/number-field"
import { TextField } from "@/components/ui/text-field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchableCombobox } from "@/components/searchable-combobox"
import { useCreateVendorInvoice } from "@/hooks/use-vendor-invoices"
import { useVendorSearch } from "@/hooks/use-entity-searches"
import { usePermissions } from "@/hooks/use-permissions"
import { useContainerLookups } from "@/hooks/use-container-lookups"
import type { Vendor } from "@/app/dashboard/vendors/columns"
import {
  vendorInvoiceBreakdownPph23Schema,
  vendorInvoiceBreakdownVatSchema,
  vendorInvoiceCurrencyPriceSchema,
  vendorInvoicePriceSchema,
  vendorInvoiceProductDescriptionSchema,
  vendorInvoiceQuantitySchema,
  vendorInvoiceVendorInvoiceTypeSchema,
  vendorInvoiceVendorSchema,
  vendorInvoiceNumberSchema,
} from "@/lib/schemas/vendor-invoice"
import { fieldError } from "@/lib/form-field"
import { zodOnChange } from "@/lib/zod-form"
import {
  vendorInvoiceInvoiceLineNet,
  vendorInvoiceInvoiceTotals,
  vendorInvoiceLineGross,
  cn,
} from "@/lib/utils"


type DraftLine = {
  key: string
  productDescription: string
  quantity: string
  price: string
  currencyPrice: string
  vatPercentage: string
  pph23Percentage: string
  containerNumber: string
  containerSizeId: string
  containerTypeId: string
}

function emptyLine(): DraftLine {
  return {
    key: crypto.randomUUID(),
    productDescription: "",
    quantity: "1",
    price: "",
    currencyPrice: "1",
    vatPercentage: "0",
    pph23Percentage: "0",
    containerNumber: "",
    containerSizeId: "",
    containerTypeId: "",
  }
}

const DOCUMENT_TYPES = [
  {
    value: "INVOICE",
    label: "Invoice",
    hint: "A normal bill from the vendor",
    icon: IconFileInvoice,
  },
  {
    value: "REIMBURSEMENT",
    label: "Reimbursement",
    hint: "Costs the vendor paid for us",
    icon: IconReceiptRefund,
  },
] as const

function CardHeading({
  icon: Icon,
  title,
  hint,
  aside,
}: {
  icon: typeof IconFileInvoice
  title: string
  hint: string
  aside?: React.ReactNode
}) {
  return (
    <header className="mb-5 flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(var(--mli-brand-rgb),0.1)] text-primary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>
      </div>
      {aside}
    </header>
  )
}

function toNumber(value: string | number, fallback = 0) {
  if (value === "" || value === null || value === undefined) return fallback
  const num = typeof value === "number" ? value : Number(value)
  return Number.isFinite(num) ? num : fallback
}

export default function VendorInvoiceCreateForm() {
  const router = useRouter()
  const createVendorInvoice = useCreateVendorInvoice()
  const { can, canReadVendorsForVendorInvoice } = usePermissions()
  const canCreateVendor = can("VENDOR", "create")

  const [vendorSearch, setVendorSearch] = useState("")
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false)
  const [createdVendor, setCreatedVendor] = useState<Vendor | null>(null)
  const [pendingFocusKey, setPendingFocusKey] = useState<string | null>(null)

  useEffect(() => {
    if (!pendingFocusKey) return

    const frame = window.requestAnimationFrame(() => {
      const card = document.querySelector<HTMLElement>(
        `[data-line-key="${pendingFocusKey}"]`
      )
      if (!card) {
        setPendingFocusKey(null)
        return
      }

      card.scrollIntoView({ behavior: "smooth", block: "nearest" })
      const input = card.querySelector<HTMLInputElement>("input")
      input?.focus()
      setPendingFocusKey(null)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [pendingFocusKey])

  const {
    data: vendorsPage,
    isLoading: isLoadingVendors,
    isFetching: isFetchingVendors,
  } = useVendorSearch(vendorSearch, canReadVendorsForVendorInvoice(), "true")

  const { data: sizesData } = useContainerLookups("size", {
    page: 1,
    pageSize: 100,
    status: "true",
  })
  const { data: typesData } = useContainerLookups("type", {
    page: 1,
    pageSize: 100,
    status: "true",
  })

  const vendorItems = useMemo(() => {
    const fromSearch =
      vendorsPage?.items
        ?.filter((vendor: Vendor) => vendor.id)
        .map((vendor: Vendor) => ({
          value: vendor.id as string,
          label: `${vendor.vendorName} (${vendor.vendorCode})`,
        })) ?? []

    if (
      createdVendor?.id &&
      !fromSearch.some((item) => item.value === createdVendor.id)
    ) {
      return [
        {
          value: createdVendor.id,
          label: `${createdVendor.vendorName} (${createdVendor.vendorCode})`,
        },
        ...fromSearch,
      ]
    }
    return fromSearch
  }, [vendorsPage?.items, createdVendor])

  const sizeOptions = sizesData?.items?.filter((item) => item.isActive) ?? []
  const typeOptions = typesData?.items?.filter((item) => item.isActive) ?? []

  const form = useForm({
    defaultValues: {
      vendorId: "-",
      vendorInvoiceType: "INVOICE" as "INVOICE" | "REIMBURSEMENT",
      vendorInvoiceNumber: "",
      vendorInvoiceDate: "",
      vendorVessel: "",
      paymentDate: "",
      breakdowns: [emptyLine()] as DraftLine[],
    },
    onSubmit: async ({ value }) => {
      const cleaned = value.breakdowns
        .map((line) => ({
          productDescription: line.productDescription.trim(),
          quantity: toNumber(line.quantity, 1),
          price: toNumber(line.price, 0),
          currencyPrice: toNumber(line.currencyPrice, 1),
          vatPercentage: toNumber(line.vatPercentage, 0),
          pph23Percentage: toNumber(line.pph23Percentage, 0),
          ...(line.containerNumber.trim()
            ? { containerNumber: line.containerNumber.trim() }
            : {}),
          ...(line.containerSizeId
            ? { containerSizeId: line.containerSizeId }
            : {}),
          ...(line.containerTypeId
            ? { containerTypeId: line.containerTypeId }
            : {}),
        }))
        .filter((line) => line.productDescription.length > 0)

      if (cleaned.length === 0) {
        toast.error("Add at least one line with a product / charge")
        return
      }

      try {
        const created = await createVendorInvoice.mutateAsync({
          vendorId: value.vendorId,
          vendorInvoiceType: value.vendorInvoiceType,
          vendorInvoiceNumber: value.vendorInvoiceNumber.trim(),
          ...(value.vendorInvoiceDate
            ? { vendorInvoiceDate: value.vendorInvoiceDate }
            : {}),
          ...(value.vendorVessel.trim()
            ? { vendorVessel: value.vendorVessel.trim() }
            : {}),
          ...(value.paymentDate ? { paymentDate: value.paymentDate } : {}),
          breakdowns: cleaned,
        })

        const id = (created as { id?: string })?.id
        if (id) {
          router.push(`/dashboard/vendor-invoices/${id}`)
        } else {
          router.push("/dashboard/vendor-invoices")
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create vendor invoice"
        )
      }
    },
  })

  // The vendor search list changes as people type, so keep the picked name.
  const [pickedVendor, setPickedVendor] = useState<{ id: string; label: string } | null>(null)
  const [openContainers, setOpenContainers] = useState<Set<string>>(() => new Set())

  function toggleContainer(key: string) {
    setOpenContainers((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const sizeName = (id: string) => sizeOptions.find((item) => item.id === id)?.name
  const typeName = (id: string) => typeOptions.find((item) => item.id === id)?.name

  type FormValues = typeof form.state.values

  function vendorLabelOf(vendorId: string) {
    if (!vendorId || vendorId === "-") return null
    return (
      vendorItems.find((item) => item.value === vendorId)?.label ??
      (pickedVendor?.id === vendorId ? pickedVendor.label : null)
    )
  }

  function renderPaper(values: FormValues) {
    const paperLines: PaperLine[] = values.breakdowns.map((line) => {
      const rate = toNumber(line.currencyPrice, 1)
      const container = [line.containerNumber.trim(), sizeName(line.containerSizeId), typeName(line.containerTypeId)]
        .filter(Boolean)
        .join(" · ")
      return {
        key: line.key,
        description: line.productDescription,
        quantity: toNumber(line.quantity, 1),
        unitIdr: toNumber(line.price, 0) * rate,
        gross: vendorInvoiceLineGross({
          price: toNumber(line.price, 0),
          currencyPrice: rate,
          quantity: toNumber(line.quantity, 1),
        }),
        vatPercentage: toNumber(line.vatPercentage, 0),
        pph23Percentage: toNumber(line.pph23Percentage, 0),
        container: container || null,
      }
    })
    return (
      <InvoicePaper
        documentType={values.vendorInvoiceType}
        vendor={vendorLabelOf(values.vendorId)}
        number={values.vendorInvoiceNumber}
        invoiceDate={values.vendorInvoiceDate}
        vessel={values.vendorVessel}
        paymentDate={values.paymentDate}
        lines={paperLines}
        totals={vendorInvoiceInvoiceTotals(values.breakdowns)}
      />
    )
  }

  // Only these small parts follow the values; the fields re-render on their own.
  const paper = (
    <form.Subscribe selector={(state) => state.values}>
      {(values) => renderPaper(values)}
    </form.Subscribe>
  )

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_27rem]"
      >
        <div className="min-w-0 space-y-5">
          <section className="rounded-xl surface p-5 sm:p-6 lg:p-7">
            <CardHeading
              icon={IconFileInvoice}
              title="Invoice details"
              hint="Copy these from the top of the vendor's paper invoice."
            />

            <form.Field
              name="vendorInvoiceType"
              validators={{
                onChange: zodOnChange(vendorInvoiceVendorInvoiceTypeSchema),
              }}
            >
              {(field) => (
                <div className="mb-5">
                  <p id="vendorInvoiceType-label" className="mb-2 text-sm font-medium text-foreground">
                    What kind of document is it?
                  </p>
                  <div
                    role="radiogroup"
                    aria-labelledby="vendorInvoiceType-label"
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    {DOCUMENT_TYPES.map((option, index) => {
                      const active = field.state.value === option.value
                      const Icon = option.icon
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          tabIndex={active ? 0 : -1}
                          onClick={() => field.handleChange(option.value)}
                          onKeyDown={(event) => {
                            if (!["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(event.key)) return
                            event.preventDefault()
                            const next = DOCUMENT_TYPES[(index + 1) % DOCUMENT_TYPES.length]
                            field.handleChange(next.value)
                            ;(event.currentTarget.parentElement?.children[DOCUMENT_TYPES.indexOf(next)] as
                              | HTMLElement
                              | undefined)?.focus()
                          }}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-xl p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                            active
                              ? "bg-card shadow-elev-1 ring-2 ring-primary"
                              : "bg-[rgba(var(--mli-inset-rgb),0.85)] hover:bg-muted"
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-lg",
                              active ? "brand-fill text-primary-foreground" : "bg-card text-muted-foreground"
                            )}
                          >
                            <Icon className="size-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-foreground">{option.label}</span>
                            <span className="block text-xs text-muted-foreground">{option.hint}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </form.Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field
                name="vendorId"
                validators={{ onChange: zodOnChange(vendorInvoiceVendorSchema) }}
              >
                {(field) => (
                  <SearchableCombobox
                    id={field.name}
                    label="Vendor"
                    required
                    items={vendorItems}
                    value={field.state.value}
                    onValueChange={(next) => {
                      field.handleChange(next)
                      const label = vendorItems.find((item) => item.value === next)?.label
                      setPickedVendor(label ? { id: next, label } : null)
                    }}
                    onSearchTermChange={setVendorSearch}
                    placeholder="Search vendor"
                    emptyMessage="No vendors found"
                    isLoading={isLoadingVendors}
                    isSearching={isFetchingVendors}
                    error={fieldError(field.state.meta.errors)}
                    quickAddLabel="Add new vendor"
                    onQuickAdd={
                      canCreateVendor
                        ? () => setVendorDialogOpen(true)
                        : undefined
                    }
                  />
                )}
              </form.Field>

              <form.Field
                name="vendorInvoiceNumber"
                validators={{ onChange: zodOnChange(vendorInvoiceNumberSchema) }}
              >
                {(field) => (
                  <TextField
                    id={field.name}
                    label="Vendor invoice # / RO #"
                    required
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    error={fieldError(field.state.meta.errors)}
                    placeholder="e.g. INV-001 / RO-123"
                    description="The number printed on the vendor's invoice."
                  />
                )}
              </form.Field>

              <form.Field name="vendorInvoiceDate">
                {(field) => (
                  <DatePicker
                    id={field.name}
                    label="Invoice date"
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    placeholder="Pick invoice date"
                    outputFormat="date-only"
                  />
                )}
              </form.Field>

              <form.Field name="paymentDate">
                {(field) => (
                  <DatePicker
                    id={field.name}
                    label="Payment date"
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    placeholder="Pick payment date"
                    outputFormat="date-only"
                    description="Leave empty if it is not paid yet."
                  />
                )}
              </form.Field>

              <form.Field name="vendorVessel">
                {(field) => (
                  <div className="sm:col-span-2">
                    <TextField
                      id={field.name}
                      label="Vessel (from invoice)"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder="Optional vessel name"
                    />
                  </div>
                )}
              </form.Field>
            </div>
          </section>

          <section className="rounded-xl surface p-5 sm:p-6 lg:p-7">
            <CardHeading
              icon={IconListDetails}
              title="Charges"
              hint="Add one row for each charge on the invoice, like freight, THC or trucking."
              aside={
                <form.Subscribe
                  selector={(state) =>
                    state.values.breakdowns.filter((line) => line.productDescription.trim()).length
                  }
                >
                  {(chargeCount) => (
                    <span className="hidden shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground tabular-nums sm:inline-flex">
                      {chargeCount} {chargeCount === 1 ? "charge" : "charges"}
                    </span>
                  )}
                </form.Subscribe>
              }
            />
            <p className="mb-4 rounded-lg bg-[rgba(var(--mli-inset-rgb),0.85)] px-3 py-2 text-xs text-muted-foreground">
              Rate changes the price into IDR. Use 1 if the price is already in IDR. VAT is added
              and PPH 23 is taken off for each charge.
            </p>

            <form.Field name="breakdowns" mode="array">
              {(arrayField) => {
                function addLine(copyFrom?: DraftLine) {
                  const line = copyFrom
                    ? { ...copyFrom, key: crypto.randomUUID() }
                    : emptyLine()
                  arrayField.pushValue(line)
                  setPendingFocusKey(line.key)
                  if (line.containerNumber.trim() || line.containerSizeId || line.containerTypeId) {
                    toggleContainer(line.key)
                  }
                }

                return (
                  <div className="space-y-3">
                    {arrayField.state.value.map((line, index) => {
                      const containerOpen = openContainers.has(line.key)
                      return (
                        <div
                          key={line.key}
                          data-line-key={line.key}
                          className="rounded-xl border border-border/80 bg-card p-4 shadow-elev-1"
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <span
                              aria-hidden
                              className="flex size-7 items-center justify-center rounded-full bg-[rgba(var(--mli-brand-rgb),0.1)] text-xs font-semibold text-primary tabular-nums"
                            >
                              {index + 1}
                            </span>
                            <p className="flex-1 text-sm font-medium text-muted-foreground">Charge</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Copy charge ${index + 1}`}
                              title="Copy this charge"
                              onClick={() => addLine(line)}
                            >
                              <IconCopy className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Remove charge ${index + 1}`}
                              title="Remove this charge"
                              className="text-destructive hover:text-destructive"
                              disabled={arrayField.state.value.length <= 1}
                              onClick={() => arrayField.removeValue(index)}
                            >
                              <IconTrash className="size-4" />
                            </Button>
                          </div>

                          <form.Field
                            name={`breakdowns[${index}].productDescription`}
                            validators={{
                              onChange: zodOnChange(vendorInvoiceProductDescriptionSchema),
                            }}
                          >
                            {(field) => (
                              <TextField
                                id={`line-${line.key}-productDescription`}
                              label="Product / charge"
                                required
                                value={field.state.value}
                                onChange={(event) =>
                                  field.handleChange(event.target.value)
                                }
                                placeholder="e.g. Ocean freight, THC, trucking"
                                error={fieldError(field.state.meta.errors)}
                              />
                            )}
                          </form.Field>

                          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1">
                            <form.Field
                              name={`breakdowns[${index}].quantity`}
                              validators={{
                                onChange: zodOnChange(vendorInvoiceQuantitySchema),
                              }}
                            >
                              {(field) => (
                                <NumberField
                                  id={`line-${line.key}-quantity`}
                                  label="Qty"
                                  required
                                  value={field.state.value}
                                  onValueChange={(value) =>
                                    field.handleChange(
                                      value === "" ? "" : String(value)
                                    )
                                  }
                                  error={fieldError(field.state.meta.errors)}
                                  maximumFractionDigits={0}
                                />
                              )}
                            </form.Field>

                            <form.Field
                              name={`breakdowns[${index}].price`}
                              validators={{
                                onChange: zodOnChange(vendorInvoicePriceSchema),
                              }}
                            >
                              {(field) => (
                                <NumberField
                                  id={`line-${line.key}-price`}
                                  label="Unit price"
                                  required
                                  value={field.state.value}
                                  onValueChange={(value) =>
                                    field.handleChange(
                                      value === "" ? "" : String(value)
                                    )
                                  }
                                  error={fieldError(field.state.meta.errors)}
                                />
                              )}
                            </form.Field>

                            <form.Field
                              name={`breakdowns[${index}].currencyPrice`}
                              validators={{
                                onChange: zodOnChange(vendorInvoiceCurrencyPriceSchema),
                              }}
                            >
                              {(field) => (
                                <NumberField
                                  id={`line-${line.key}-currencyPrice`}
                                  label="Rate"
                                  required
                                  value={field.state.value}
                                  onValueChange={(value) =>
                                    field.handleChange(
                                      value === "" ? "" : String(value)
                                    )
                                  }
                                  error={fieldError(field.state.meta.errors)}
                                />
                              )}
                            </form.Field>

                            <form.Field
                              name={`breakdowns[${index}].vatPercentage`}
                              validators={{
                                onChange: zodOnChange(vendorInvoiceBreakdownVatSchema),
                              }}
                            >
                              {(field) => (
                                <NumberField
                                  id={`line-${line.key}-vatPercentage`}
                                  label="VAT %"
                                  required
                                  value={field.state.value}
                                  onValueChange={(value) =>
                                    field.handleChange(
                                      value === "" ? "" : String(value)
                                    )
                                  }
                                  error={fieldError(field.state.meta.errors)}
                                  useGrouping={false}
                                  maximumFractionDigits={2}
                                  placeholder="0"
                                />
                              )}
                            </form.Field>

                            <form.Field
                              name={`breakdowns[${index}].pph23Percentage`}
                              validators={{
                                onChange: zodOnChange(vendorInvoiceBreakdownPph23Schema),
                              }}
                            >
                              {(field) => (
                                <NumberField
                                  id={`line-${line.key}-pph23Percentage`}
                                  label="PPH 23 %"
                                  required
                                  value={field.state.value}
                                  onValueChange={(value) =>
                                    field.handleChange(
                                      value === "" ? "" : String(value)
                                    )
                                  }
                                  error={fieldError(field.state.meta.errors)}
                                  useGrouping={false}
                                  maximumFractionDigits={2}
                                  placeholder="0"
                                />
                              )}
                            </form.Field>
                          </div>

                          {containerOpen ? (
                            <div className="mt-4 rounded-lg bg-[rgba(var(--mli-inset-rgb),0.85)] p-3">
                              <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <IconBox className="size-3.5" /> Container for this charge
                              </p>
                              <div className="grid gap-3 sm:grid-cols-3">
                                <form.Field
                                  name={`breakdowns[${index}].containerNumber`}
                                >
                                  {(field) => (
                                    <TextField
                                      id={`line-${line.key}-containerNumber`}
                                  label="Container number"
                                      value={field.state.value}
                                      onChange={(event) =>
                                        field.handleChange(event.target.value)
                                      }
                                      placeholder="e.g. MSKU1234567"
                                    />
                                  )}
                                </form.Field>

                                <form.Field
                                  name={`breakdowns[${index}].containerSizeId`}
                                >
                                  {(field) => (
                                    <div>
                                      <FormLabel
                                        htmlFor={field.name}
                                        className="my-2"
                                      >
                                        Size
                                      </FormLabel>
                                      <Select
                                        value={field.state.value || "-"}
                                        onValueChange={(value) =>
                                          field.handleChange(
                                            value === "-" ? "" : value
                                          )
                                        }
                                      >
                                        <SelectTrigger
                                          id={field.name}
                                          className="w-full"
                                        >
                                          <SelectValue placeholder="Select size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="-">None</SelectItem>
                                          {sizeOptions.map((size) => (
                                            <SelectItem
                                              key={size.id}
                                              value={size.id ?? ""}
                                            >
                                              {size.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                </form.Field>

                                <form.Field
                                  name={`breakdowns[${index}].containerTypeId`}
                                >
                                  {(field) => (
                                    <div>
                                      <FormLabel
                                        htmlFor={field.name}
                                        className="my-2"
                                      >
                                        Type
                                      </FormLabel>
                                      <Select
                                        value={field.state.value || "-"}
                                        onValueChange={(value) =>
                                          field.handleChange(
                                            value === "-" ? "" : value
                                          )
                                        }
                                      >
                                        <SelectTrigger
                                          id={field.name}
                                          className="w-full"
                                        >
                                          <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="-">None</SelectItem>
                                          {typeOptions.map((type) => (
                                            <SelectItem
                                              key={type.id}
                                              value={type.id ?? ""}
                                            >
                                              {type.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                </form.Field>
                              </div>
                            </div>
                          ) : null}

                          <form.Subscribe selector={(state) => state.values.breakdowns[index]}>
                            {(row) => {
                              const hasContainer = Boolean(
                                row?.containerNumber.trim() || row?.containerSizeId || row?.containerTypeId
                              )
                              const net = vendorInvoiceInvoiceLineNet({
                                price: toNumber(row?.price ?? "", 0),
                                currencyPrice: toNumber(row?.currencyPrice ?? "", 1),
                                quantity: toNumber(row?.quantity ?? "", 1),
                                vatPercentage: toNumber(row?.vatPercentage ?? "", 0),
                                pph23Percentage: toNumber(row?.pph23Percentage ?? "", 0),
                              })
                              return (
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
                                  <button
                                    type="button"
                                    onClick={() => toggleContainer(line.key)}
                                    aria-expanded={containerOpen}
                                    className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-primary hover:bg-[rgba(var(--mli-brand-rgb),0.08)]"
                                  >
                                    <IconChevronDown
                                      className={cn("size-3.5 transition-transform", containerOpen && "rotate-180")}
                                    />
                                    {containerOpen
                                      ? "Hide container"
                                      : hasContainer
                                        ? "Show container"
                                        : "Add container (optional)"}
                                  </button>
                                  <p className="text-sm text-muted-foreground">
                                    Charge total{" "}
                                    <span className="font-semibold text-foreground tabular-nums">
                                      {formatIdr(net)}
                                    </span>
                                  </p>
                                </div>
                              )
                            }}
                          </form.Subscribe>
                        </div>
                      )
                    })}

                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 w-full border-dashed"
                      onClick={() => addLine()}
                    >
                      <IconPlus className="size-4" />
                      Add another charge
                    </Button>
                  </div>
                )
              }}
            </form.Field>
          </section>

          {/* Phones and tablets: the paper preview sits under the form. */}
          <div className="space-y-3 lg:hidden">
            <p className="px-1 text-sm font-medium text-foreground">Preview</p>
            {paper}
          </div>

          <div className="sticky bottom-3 z-20 lg:hidden">
            <div className="flex items-center gap-3 rounded-2xl surface p-3 shadow-elev-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">To pay the vendor</p>
                <form.Subscribe selector={(state) => vendorInvoiceInvoiceTotals(state.values.breakdowns).net}>
                  {(net) => (
                    <p className="truncate text-base font-semibold text-foreground tabular-nums">
                      {formatIdr(net)}
                    </p>
                  )}
                </form.Subscribe>
              </div>
              <Button type="submit" disabled={createVendorInvoice.isPending}>
                {createVendorInvoice.isPending ? "Saving…" : "Create"}
              </Button>
            </div>
          </div>
        </div>

        <aside className="hidden space-y-4 lg:sticky lg:top-24 lg:block">
          {paper}
          <div className="flex gap-2">
            <Button type="submit" size="lg" className="flex-1" disabled={createVendorInvoice.isPending}>
              {createVendorInvoice.isPending ? "Saving…" : "Create vendor invoice"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push("/dashboard/vendor-invoices")}
            >
              Cancel
            </Button>
          </div>
          <p className="px-1 text-xs text-muted-foreground">
            The preview follows what you type. Empty charges are skipped when you save.
          </p>
        </aside>
      </form>

      <QuickAddVendorDialog
        open={vendorDialogOpen}
        onOpenChange={setVendorDialogOpen}
        onCreated={(vendor) => {
          setCreatedVendor(vendor)
          if (vendor.id) {
            form.setFieldValue("vendorId", vendor.id)
          }
        }}
      />
    </>
  )
}

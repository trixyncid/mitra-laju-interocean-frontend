"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

import { QuickAddVendorDialog } from "@/components/forms/quick-add-vendor-dialog"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
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
import { useCreateCosting } from "@/hooks/use-costings"
import { useVendorSearch } from "@/hooks/use-entity-searches"
import { usePermissions } from "@/hooks/use-permissions"
import { useContainerLookups } from "@/hooks/use-container-lookups"
import type { Vendor } from "@/app/dashboard/vendors/columns"
import {
  costingBreakdownPph23Schema,
  costingBreakdownVatSchema,
  costingCurrencyPriceSchema,
  costingPriceSchema,
  costingProductDescriptionSchema,
  costingQuantitySchema,
  costingVendorInvoiceTypeSchema,
  costingVendorSchema,
} from "@/lib/schemas/costing"
import { fieldError } from "@/lib/form-field"
import { zodOnChange } from "@/lib/zod-form"
import {
  costingInvoiceLineNet,
  costingInvoiceTotals,
  costingLinePph23Amount,
  costingLineUnitPlusPpn,
  cn,
} from "@/lib/utils"
import { glassInset } from "@/lib/design"

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 4 }, (_, i) => currentYear - 1 + i)

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

function formatIdr(value: number) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

function toNumber(value: string | number, fallback = 0) {
  if (value === "" || value === null || value === undefined) return fallback
  const num = typeof value === "number" ? value : Number(value)
  return Number.isFinite(num) ? num : fallback
}

export default function CostingCreateForm() {
  const router = useRouter()
  const createCosting = useCreateCosting()
  const { can, canReadVendorsForCosting } = usePermissions()
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
  } = useVendorSearch(vendorSearch, canReadVendorsForCosting(), "true")

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
      month: new Date().getMonth() + 1,
      year: currentYear,
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
        const created = await createCosting.mutateAsync({
          month: value.month,
          year: value.year,
          vendorId: value.vendorId,
          vendorInvoiceType: value.vendorInvoiceType,
          ...(value.vendorInvoiceNumber.trim()
            ? { vendorInvoiceNumber: value.vendorInvoiceNumber.trim() }
            : {}),
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
          router.push(`/dashboard/costings/${id}`)
        } else {
          router.push("/dashboard/costings")
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create costing"
        )
      }
    },
  })

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
        className="space-y-8"
      >
        <section className="space-y-4">
          <div>
            <h2 className="text-headline-md font-semibold tracking-tight">
              Vendor invoice
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Capture the invoice header first. Line items come next.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="month">
              {(field) => (
                <div>
                  <FormLabel htmlFor={field.name} className="my-2" required>
                    Month
                  </FormLabel>
                  <Select
                    value={String(field.state.value)}
                    onValueChange={(next) => field.handleChange(Number(next))}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTH_NAMES.map((name, index) => (
                        <SelectItem key={name} value={String(index + 1)}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name="year">
              {(field) => (
                <div>
                  <FormLabel htmlFor={field.name} className="my-2" required>
                    Year
                  </FormLabel>
                  <Select
                    value={String(field.state.value)}
                    onValueChange={(next) => field.handleChange(Number(next))}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEAR_OPTIONS.map((option) => (
                        <SelectItem key={option} value={String(option)}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>

          <FieldDescription>
            The costing number is generated automatically from this month and
            year.
          </FieldDescription>

          <form.Field
            name="vendorInvoiceType"
            validators={{
              onChange: zodOnChange(costingVendorInvoiceTypeSchema),
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name} className="cursor-default">
                  Document type
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={field.state.value}
                    onValueChange={(next) =>
                      field.handleChange(
                        next as "INVOICE" | "REIMBURSEMENT"
                      )
                    }
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INVOICE">Invoice</SelectItem>
                      <SelectItem value="REIMBURSEMENT">
                        Reimbursement
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            )}
          </form.Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field
              name="vendorId"
              validators={{ onChange: zodOnChange(costingVendorSchema) }}
            >
              {(field) => (
                <SearchableCombobox
                  label="Vendor"
                  required
                  items={vendorItems}
                  value={field.state.value}
                  onValueChange={field.handleChange}
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

            <form.Field name="vendorInvoiceNumber">
              {(field) => (
                <TextField
                  label="Vendor invoice # / RO #"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="e.g. INV-001 / RO-123"
                  description="Invoice and RO number as printed on the vendor document"
                />
              )}
            </form.Field>

            <form.Field name="vendorInvoiceDate">
              {(field) => (
                <DatePicker
                  label="Invoice date"
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  placeholder="Pick invoice date"
                  outputFormat="date-only"
                />
              )}
            </form.Field>

            <form.Field name="vendorVessel">
              {(field) => (
                <TextField
                  label="Vessel (from invoice)"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Optional vessel name"
                />
              )}
            </form.Field>

            <form.Field name="paymentDate">
              {(field) => (
                <DatePicker
                  label="Payment date"
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  placeholder="Pick payment date"
                  outputFormat="date-only"
                  description="Optional — leave blank if unpaid"
                />
              )}
            </form.Field>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-headline-md font-semibold tracking-tight">
              Line items
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Each row is a charge on the vendor invoice. You can assign
              shipments later.
            </p>
          </div>

          <form.Field name="breakdowns" mode="array">
            {(arrayField) => {
              function addLine() {
                const line = emptyLine()
                arrayField.pushValue(line)
                setPendingFocusKey(line.key)
              }

              return (
              <div className="space-y-3">
                {arrayField.state.value.map((line, index) => (
                  <div
                    key={line.key}
                    data-line-key={line.key}
                    className={cn(glassInset, "space-y-4 p-4")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
                        Line {index + 1}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={arrayField.state.value.length <= 1}
                        onClick={() => arrayField.removeValue(index)}
                      >
                        <IconTrash className="size-4" />
                        Remove
                      </Button>
                    </div>

                    <form.Field
                      name={`breakdowns[${index}].productDescription`}
                      validators={{
                        onChange: zodOnChange(costingProductDescriptionSchema),
                      }}
                    >
                      {(field) => (
                        <TextField
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

                    <div className="space-y-2">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <form.Field
                          name={`breakdowns[${index}].quantity`}
                          validators={{
                            onChange: zodOnChange(costingQuantitySchema),
                          }}
                        >
                          {(field) => (
                            <NumberField
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
                            onChange: zodOnChange(costingPriceSchema),
                          }}
                        >
                          {(field) => (
                            <NumberField
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
                            onChange: zodOnChange(costingCurrencyPriceSchema),
                          }}
                        >
                          {(field) => (
                            <NumberField
                              label="Exchange rate"
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
                            onChange: zodOnChange(costingBreakdownVatSchema),
                          }}
                        >
                          {(field) => (
                            <NumberField
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
                            onChange: zodOnChange(costingBreakdownPph23Schema),
                          }}
                        >
                          {(field) => (
                            <NumberField
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
                      <FieldDescription>
                        Exchange rate converts the unit price to IDR. Use 1 if
                        the price is already in IDR. VAT and PPH 23 apply to
                        this line.
                      </FieldDescription>
                    </div>

                    <div className="rounded-md border border-[rgba(214,227,255,0.55)] bg-[rgba(247,249,251,0.55)] p-4">
                      <div className="mb-3">
                        <p className="text-sm font-medium text-foreground">
                          Container details
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          Optional — fill these in when this charge belongs to a
                          specific container.
                        </p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <form.Field
                          name={`breakdowns[${index}].containerNumber`}
                        >
                          {(field) => (
                            <TextField
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

                    <form.Subscribe
                      selector={(state) => state.values.breakdowns[index]}
                    >
                      {(row) => {
                        const line = {
                          price: toNumber(row?.price, 0),
                          currencyPrice: toNumber(row?.currencyPrice, 1),
                          quantity: toNumber(row?.quantity, 1),
                          vatPercentage: toNumber(row?.vatPercentage, 0),
                          pph23Percentage: toNumber(row?.pph23Percentage, 0),
                        }
                        return (
                          <div className="space-y-2 border-t border-[rgba(214,227,255,0.45)] pt-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm text-muted-foreground">
                                Unit + PPN
                              </p>
                              <p className="text-sm font-medium tabular-nums">
                                {formatIdr(costingLineUnitPlusPpn(line))}
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm text-muted-foreground">
                                PPH 23 amt
                              </p>
                              <p className="text-sm font-medium tabular-nums">
                                {formatIdr(costingLinePph23Amount(line))}
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm text-muted-foreground">
                                Net amount
                              </p>
                              <p className="text-base font-semibold tracking-tight tabular-nums">
                                {formatIdr(costingInvoiceLineNet(line))}
                              </p>
                            </div>
                          </div>
                        )
                      }}
                    </form.Subscribe>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full border-dashed"
                  onClick={addLine}
                >
                  <IconPlus className="size-4" />
                  Add line
                </Button>
              </div>
              )
            }}
          </form.Field>
        </section>

        <form.Subscribe selector={(state) => state.values.breakdowns}>
          {(breakdowns) => {
            const totals = costingInvoiceTotals(breakdowns)
            const lineCount = breakdowns.length

            return (
              <section
                className={cn(
                  glassInset,
                  "overflow-hidden p-0"
                )}
              >
                <div className="grid gap-0 lg:grid-cols-[1fr_auto]">
                  <div className="space-y-4 p-5 sm:p-6">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                        Invoice total
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Based on {lineCount} line
                        {lineCount === 1 ? "" : "s"} entered above.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-muted-foreground">Gross</span>
                        <span className="tabular-nums font-medium">
                          {formatIdr(totals.gross)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-muted-foreground">VAT</span>
                        <span className="tabular-nums font-medium text-muted-foreground">
                          {formatIdr(totals.vatAmount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-muted-foreground">PPH 23</span>
                        <span className="tabular-nums font-medium text-muted-foreground">
                          − {formatIdr(totals.pph23Amount)}
                        </span>
                      </div>
                      <div className="border-t border-[rgba(214,227,255,0.55)] pt-3">
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium">Vendor payable</p>
                            <p className="text-xs text-muted-foreground">
                              Amount due to vendor (gross + VAT − PPH 23)
                            </p>
                          </div>
                          <p className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
                            {formatIdr(totals.net)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-end gap-2 border-t border-[rgba(214,227,255,0.45)] bg-[rgba(247,249,251,0.55)] p-5 sm:flex-row sm:items-center lg:border-t-0 lg:border-l lg:p-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard/costings")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createCosting.isPending}>
                      {createCosting.isPending ? "Saving…" : "Create costing"}
                    </Button>
                  </div>
                </div>
              </section>
            )
          }}
        </form.Subscribe>
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
    </div>
  )
}

"use client"

import { useState, type ReactNode } from "react"
import { IconLink, IconPlus, IconSparkles } from "@tabler/icons-react"

import { formatIdr } from "@/components/dashboard/overview-card"
import { SearchableCombobox } from "@/components/searchable-combobox"
import { CostingMultiPicker } from "@/components/sellings/costing-multi-picker"
import { formatPercent, MARGIN_TONE, sellingMargin } from "@/components/sellings/selling-margin"
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
import { useCreateSellingLine, useSellingSalesOptions, useUpdateSellingLine } from "@/hooks/use-selling-lines"
import type { Costing } from "@/lib/types/costing"
import type { Selling } from "@/lib/types/selling"
import {
  cn,
  vendorInvoiceInvoiceLineNet,
  vendorInvoiceLineGross,
  vendorInvoiceLinePph23Amount,
  vendorInvoiceLineVatAmount,
} from "@/lib/utils"

type FormState = {
  sellingDescription: string
  salesId: string
  quantity: number | ""
  price: number | ""
  currencyPrice: number | ""
  vatPercentage: number | ""
  pph23Percentage: number | ""
  costings: Costing[]
  markup: number | ""
}

type Errors = Partial<Record<keyof FormState, string>>

const NONE = "-"

function initialState(selling?: Selling, defaultSalesId?: string, defaultDescription = ""): FormState {
  return {
    sellingDescription: selling?.sellingDescription ?? defaultDescription,
    salesId: selling?.salesId ?? defaultSalesId ?? NONE,
    quantity: selling ? Number(selling.quantity) : 1,
    price: selling ? Number(selling.price) : "",
    currencyPrice: selling ? Number(selling.currencyPrice) : 1,
    vatPercentage: selling ? Number(selling.vatPercentage) : 0,
    pph23Percentage: selling ? Number(selling.pph23Percentage) : 0,
    costings: [],
    markup: 15,
  }
}

function validate(values: FormState): Errors {
  const errors: Errors = {}
  if (!values.sellingDescription.trim()) errors.sellingDescription = "Description is required"
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

export function SellingFormDialog({
  mode,
  selling,
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
  selling?: Selling
  /** Prefills the description, e.g. with what was searched for. */
  defaultDescription?: string
  /** The job isn't saved yet: show this instead of the sales job picker and leave it unset. */
  pendingSalesJob?: string
  defaultSalesId?: string
  /** Shown for `defaultSalesId` when it isn't among the recent sales options. */
  defaultSalesLabel?: string
  trigger?: ReactNode
  onSaved?: (selling: Selling) => void
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpenState] = useState(defaultOpen)
  const setOpen = (next: boolean) => {
    setOpenState(next)
    onOpenChange?.(next)
  }
  const [values, setValues] = useState<FormState>(() => initialState(selling, defaultSalesId, defaultDescription))
  const [errors, setErrors] = useState<Errors>({})
  const [salesSearch, setSalesSearch] = useState("")
  const createSelling = useCreateSellingLine()
  const updateSelling = useUpdateSellingLine()
  const pending = createSelling.isPending || updateSelling.isPending

  const salesQuery = useSellingSalesOptions(salesSearch, open && !pendingSalesJob)

  const salesOptions = salesQuery.data ?? []
  const salesItems = (() => {
    const items = [
      { value: NONE, label: "No sales job" },
      ...salesOptions.map((sales) => ({
        value: sales.id,
        label: sales.customer ? `${sales.salesNumber} · ${sales.customer.customerName}` : sales.salesNumber,
      })),
    ]
    if (selling?.sales && !items.some((item) => item.value === selling.sales!.id)) {
      items.splice(1, 0, { value: selling.sales.id, label: selling.sales.salesNumber })
    }
    if (defaultSalesId && !items.some((item) => item.value === defaultSalesId)) {
      items.splice(1, 0, { value: defaultSalesId, label: defaultSalesLabel ?? "This sales job" })
    }
    return items
  })()

  const amounts = {
    quantity: values.quantity || 0,
    price: values.price || 0,
    currencyPrice: values.currencyPrice || 0,
    vatPercentage: values.vatPercentage || 0,
    pph23Percentage: values.pph23Percentage || 0,
  }
  const linked = mode === "create" ? values.costings : selling?.costings ?? []
  const margin = sellingMargin(amounts, linked)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }

  /** Unit price that recovers the selected cost plus the markup. */
  const suggestPrice = () => {
    const qty = Number(values.quantity) || 1
    const rate = Number(values.currencyPrice) || 1
    const target = margin.cost * (1 + (Number(values.markup) || 0) / 100)
    set("price", Math.ceil((target / (qty * rate)) * 100) / 100)
  }

  const submit = async (addAnother: boolean) => {
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    const fields = {
      sellingDescription: values.sellingDescription.trim(),
      salesId: values.salesId === NONE ? null : values.salesId,
      quantity: Number(values.quantity),
      price: Number(values.price),
      currencyPrice: Number(values.currencyPrice),
      vatPercentage: Number(values.vatPercentage),
      pph23Percentage: Number(values.pph23Percentage),
    }
    const saved =
      mode === "create"
        ? await createSelling.mutateAsync({ ...fields, costingIds: values.costings.map((costing) => costing.id) })
        : await updateSelling.mutateAsync({ id: selling!.id, selling: fields })
    onSaved?.(saved)
    if (addAnother) {
      // Keep the sales job and taxes: consecutive lines usually share them.
      setValues((current) => ({ ...current, sellingDescription: "", price: "", quantity: 1, costings: [] }))
      setErrors({})
    } else {
      setOpen(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return
        setOpen(next)
        if (next) {
          setValues(initialState(selling, defaultSalesId, defaultDescription))
          setErrors({})
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <IconPlus className="size-4" />
            New selling
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New selling line" : "Edit selling line"}</DialogTitle>
          <DialogDescription>
            What you charge the customer. Link the costings it recovers to see the margin.
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
          <div className="sm:col-span-2">
            <TextField
              label="Description"
              required
              id="sellingDescription"
              placeholder="e.g. Ocean freight Tanjung Priok → Port Klang (door to port)"
              value={values.sellingDescription}
              onChange={(event) => set("sellingDescription", event.target.value)}
              error={errors.sellingDescription}
            />
          </div>
          {pendingSalesJob ? (
            <div className="sm:col-span-2">
              <p className="mb-1.5 text-sm font-medium text-foreground">Sales job</p>
              <p className="flex h-10 items-center gap-2 rounded-full bg-muted px-5 text-sm text-foreground">
                <IconLink className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{pendingSalesJob}</span>
              </p>
            </div>
          ) : (
          <div className="sm:col-span-2">
            <SearchableCombobox
              label="Sales job"
              description="Optional."
              items={salesItems}
              value={values.salesId}
              onValueChange={(value) => set("salesId", value || NONE)}
              onSearchTermChange={setSalesSearch}
              placeholder="Search sales number"
              emptyMessage="No sales jobs found"
              isLoading={salesQuery.isLoading}
              isSearching={salesQuery.isFetching}
            />
          </div>
          )}

          {mode === "create" ? (
            <div className="space-y-2 rounded-xl border border-border p-3 sm:col-span-2">
              <div>
                <p className="text-sm font-medium text-foreground">Costings (optional)</p>
                <p className="text-xs text-muted-foreground">
                  The costs this charge recovers. Link any number now, or later from the selling.
                </p>
              </div>
              <CostingMultiPicker
                selected={values.costings}
                onChange={(costings) => set("costings", costings)}
                enabled={open}
                salesId={values.salesId === NONE ? null : values.salesId}
              />
              {values.costings.length > 0 ? (
                <div className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
                  <div className="w-28">
                    <NumberField
                      label="Markup %"
                      id="markup"
                      value={values.markup}
                      onValueChange={(value) => set("markup", value)}
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={suggestPrice}>
                    <IconSparkles className="size-4" />
                    Suggest price
                  </Button>
                  <p className="pb-2 text-xs text-muted-foreground">
                    Sets the unit price to cover {formatIdr(margin.cost)} plus the markup.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          <NumberField
            label="Quantity"
            required
            id="sellingQuantity"
            value={values.quantity}
            onValueChange={(value) => set("quantity", value)}
            maximumFractionDigits={0}
            error={errors.quantity}
          />
          <NumberField
            label="Unit price"
            required
            id="sellingPrice"
            placeholder="0"
            value={values.price}
            onValueChange={(value) => set("price", value)}
            error={errors.price}
          />
          <NumberField
            label="Exchange rate"
            required
            id="sellingRate"
            description="Use 1 for IDR prices."
            value={values.currencyPrice}
            onValueChange={(value) => set("currencyPrice", value)}
            error={errors.currencyPrice}
          />
          <div className="grid grid-cols-2 gap-4">
            <NumberField
              label="VAT %"
              id="sellingVat"
              value={values.vatPercentage}
              onValueChange={(value) => set("vatPercentage", value)}
              error={errors.vatPercentage}
            />
            <NumberField
              label="PPH 23 %"
              id="sellingPph"
              value={values.pph23Percentage}
              onValueChange={(value) => set("pph23Percentage", value)}
              error={errors.pph23Percentage}
            />
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl bg-muted/70 p-4 text-sm sm:col-span-2 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">Revenue</dt>
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
              <dt className="text-xs text-muted-foreground">Net to invoice</dt>
              <dd className="font-semibold tabular-nums text-foreground">{formatIdr(vendorInvoiceInvoiceLineNet(amounts))}</dd>
            </div>
            {linked.length > 0 ? (
              <div className="col-span-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 sm:col-span-4">
                <span className="text-xs text-muted-foreground">
                  Cost <span className="font-medium tabular-nums text-foreground">{formatIdr(margin.cost)}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  Margin before tax{" "}
                  <span className="font-semibold tabular-nums text-foreground">{formatIdr(margin.margin)}</span>
                </span>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", MARGIN_TONE[margin.state])}>
                  {formatPercent(margin.percent)}
                </span>
              </div>
            ) : null}
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

"use client"

import { useState, type ReactNode } from "react"
import { IconAlertTriangle, IconCalculator, IconChevronDown, IconHash, IconPackages, IconPlus, IconShip, IconTag } from "@tabler/icons-react"

import { CostingFormDialog } from "@/components/costings/costing-form-dialog"
import { costingToLine, SalesLinePicker, sellingToLine, type PickedLine } from "@/components/sales/sales-line-picker"
import { salesNumberPattern } from "@/components/sales/sales-pnl"
import { ShipmentPicker } from "@/components/sales/shipment-picker"
import { SearchableCombobox } from "@/components/searchable-combobox"
import { SellingFormDialog } from "@/components/sellings/selling-form-dialog"
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
import { useCustomerSearch } from "@/hooks/use-customer-search"
import { useCreateSales, useUpdateSales } from "@/hooks/use-sales"
import { usePermissions } from "@/hooks/use-permissions"
import { shipmentReference } from "@/lib/shipment-reference"
import type { Sales, SalesShipment, SalesType, SalesUpdate } from "@/lib/types/sales"
import { cn } from "@/lib/utils"

const NONE = "-"

const TYPE_OPTIONS: { value: SalesType; title: string; body: string; icon: typeof IconShip }[] = [
  {
    value: "SHIPMENT",
    title: "Shipment",
    body: "One shipment with its costings and sellings.",
    icon: IconShip,
  },
  {
    value: "OTHERS",
    title: "Others",
    body: "Costings and sellings without a shipment, e.g. customs or trucking only.",
    icon: IconPackages,
  },
]

type FormState = {
  salesType: SalesType
  shipment: SalesShipment | null
  customerId: string
  costings: PickedLine[]
  sellings: PickedLine[]
}

function initialState(sales?: Sales, defaultShipment?: SalesShipment): FormState {
  return {
    salesType: sales?.salesType ?? "SHIPMENT",
    shipment: sales?.shipment ?? defaultShipment ?? null,
    customerId: sales?.customerId ?? defaultShipment?.customerCodeId ?? NONE,
    costings: [],
    sellings: [],
  }
}

/** The number's shape, since the server assigns the sequence and letters on save. */
function NumberPreview() {
  const { prefix, roman, year } = salesNumberPattern()
  const letters = <span className="text-muted-foreground">••</span>
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/70 px-3.5 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-muted-foreground">
        <IconHash className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-sm font-semibold text-foreground">
          {prefix}
          {letters}
          <span className="text-muted-foreground">###</span>/M{roman}
          {letters}/{year}
        </p>
        <p className="text-xs text-muted-foreground">
          Assigned when you save. ### is this month’s next number; •• are random letters.
        </p>
      </div>
    </div>
  )
}

export function SalesFormDialog({
  mode,
  sales,
  trigger,
  onSaved,
  defaultOpen = false,
  onOpenChange,
  defaultShipment,
}: {
  mode: "create" | "edit"
  sales?: Sales
  /** Prefill a new shipment job with this shipment, e.g. when started from the shipment itself. */
  defaultShipment?: SalesShipment
  trigger?: ReactNode
  onSaved?: (sales: Sales) => void
  /** Open on mount, e.g. when arriving from a "new sales job" link. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpenState] = useState(defaultOpen)
  const setOpen = (next: boolean) => {
    setOpenState(next)
    onOpenChange?.(next)
  }
  const [values, setValues] = useState<FormState>(() => initialState(sales, defaultShipment))
  const [shipmentError, setShipmentError] = useState<string>()
  const [linesOpen, setLinesOpen] = useState(false)
  const [lineTab, setLineTab] = useState<"costings" | "sellings">("costings")
  const [customerSearch, setCustomerSearch] = useState("")
  const createSales = useCreateSales()
  const updateSales = useUpdateSales()
  const pending = createSales.isPending || updateSales.isPending
  const { can, canPick } = usePermissions()
  /** A costing or selling being created from the picker, prefilled with what was searched for. */
  const [creating, setCreating] = useState<{ kind: "costings" | "sellings"; description: string } | null>(null)
  const pickNew = (kind: "costings" | "sellings", line: PickedLine) =>
    setValues((current) => ({ ...current, [kind]: [...current[kind], { ...line, isNew: true }] }))
  const customersQuery = useCustomerSearch(customerSearch, open)

  const isShipment = values.salesType === "SHIPMENT"
  const releasing = mode === "edit" && !isShipment && sales?.shipment ? sales.shipment : null

  const customerItems = (() => {
    const items = [
      { value: NONE, label: isShipment ? "Shipment's customer" : "No customer" },
      ...(customersQuery.data?.items ?? [])
        .filter((customer) => customer.id)
        .map((customer) => ({ value: customer.id as string, label: `${customer.customerName} (${customer.customerCode})` })),
    ]
    const known = [
      sales?.customer ? { value: sales.customer.id, label: `${sales.customer.customerName} (${sales.customer.customerCode})` } : null,
      values.shipment?.customerCode
        ? {
            value: values.shipment.customerCodeId,
            label: `${values.shipment.customerCode.customerName} (${values.shipment.customerCode.customerCode})`,
          }
        : null,
    ]
    for (const item of known) {
      if (item && !items.some((existing) => existing.value === item.value)) items.splice(1, 0, item)
    }
    return items
  })()

  const pickShipment = (shipment: SalesShipment | null) => {
    setShipmentError(undefined)
    setValues((current) => ({
      ...current,
      shipment,
      // Bill the shipment's customer unless one was picked by hand.
      customerId:
        shipment && (current.customerId === NONE || current.customerId === current.shipment?.customerCodeId)
          ? shipment.customerCodeId
          : current.customerId,
    }))
  }

  const submit = async () => {
    if (isShipment && !values.shipment) {
      setShipmentError("Choose the shipment for this job")
      return
    }
    const customerId = values.customerId === NONE ? null : values.customerId
    if (mode === "create") {
      const saved = await createSales.mutateAsync({
        salesType: values.salesType,
        ...(isShipment ? { shipmentId: values.shipment!.id } : {}),
        customerId,
        costingIds: values.costings.map((line) => line.id),
        sellingIds: values.sellings.map((line) => line.id),
      })
      onSaved?.(saved)
    } else {
      const changes: SalesUpdate = {}
      if (values.salesType !== sales!.salesType) changes.salesType = values.salesType
      if (isShipment && values.shipment?.id !== sales!.shipment?.id) changes.shipmentId = values.shipment!.id
      if (customerId !== sales!.customerId) changes.customerId = customerId
      const saved = Object.keys(changes).length ? await updateSales.mutateAsync({ id: sales!.id, sales: changes }) : sales!
      onSaved?.(saved)
    }
    setOpen(false)
  }

  const lineCount = values.costings.length + values.sellings.length
  const canCreateCostings = can("COSTING", "create")
  const canCreateSellings = can("SELLING", "create")
  const canPickCostings = canPick("COSTING") || canCreateCostings
  const canPickSellings = canPick("SELLING") || canCreateSellings
  const createdCount = [...values.costings, ...values.sellings].filter((line) => line.isNew).length

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return
        setOpen(next)
        if (next) {
          setValues(initialState(sales, defaultShipment))
          setShipmentError(undefined)
          setLinesOpen(false)
          setCreating(null)
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <IconPlus className="size-4" />
            New sales job
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New sales job" : `Edit ${sales?.salesNumber}`}</DialogTitle>
          <DialogDescription>
            A sales job groups what a piece of work cost and what it was charged, so its profit is in one place.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            void submit()
          }}
          className="space-y-5"
        >
          {mode === "create" ? <NumberPreview /> : null}

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-foreground">Type</legend>
            <div role="radiogroup" aria-label="Sales type" className="grid gap-2 sm:grid-cols-2">
              {TYPE_OPTIONS.map((option) => {
                const active = values.salesType === option.value
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setShipmentError(undefined)
                      setValues((current) => ({ ...current, salesType: option.value }))
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

          {isShipment ? (
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-foreground">
                Shipment <span className="text-destructive">*</span>
              </legend>
              <ShipmentPicker value={values.shipment} onChange={pickShipment} enabled={open} error={shipmentError} />
            </fieldset>
          ) : releasing ? (
            <p className="flex items-start gap-2 rounded-xl bg-[var(--mli-warning-container)] px-3.5 py-3 text-sm text-[var(--mli-on-warning-container)]">
              <IconAlertTriangle className="mt-0.5 size-4 shrink-0" />
              Shipment {shipmentReference(releasing)} will be released from this job. Its costings and sellings stay.
            </p>
          ) : null}

          <SearchableCombobox
            label="Customer"
            description={isShipment ? "Defaults to the shipment's customer." : "Optional — who this work is for."}
            items={customerItems}
            value={values.customerId}
            onValueChange={(value) => setValues((current) => ({ ...current, customerId: value || NONE }))}
            onSearchTermChange={setCustomerSearch}
            placeholder="Search customer"
            emptyMessage="No customers found"
            isLoading={customersQuery.isLoading}
            isSearching={customersQuery.isFetching}
          />

          {mode === "create" && (canPickCostings || canPickSellings) ? (
            <section className="rounded-xl border border-border">
              <button
                type="button"
                aria-expanded={linesOpen}
                onClick={() => setLinesOpen((value) => !value)}
                className="flex w-full cursor-pointer items-center gap-3 p-3 text-left"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">Costings & sellings (optional)</span>
                  <span className="block text-xs text-muted-foreground">
                    {lineCount
                      ? `${values.costings.length} costing${values.costings.length === 1 ? "" : "s"} · ${values.sellings.length} selling${values.sellings.length === 1 ? "" : "s"} selected`
                      : "Pick ones already entered, or create new ones here. You can also add them after creating the job."}
                  </span>
                </span>
                <IconChevronDown className={cn("size-4 text-muted-foreground transition-transform", linesOpen && "rotate-180")} />
              </button>
              {linesOpen ? (
                <div className="space-y-3 border-t border-border p-3">
                  <div role="tablist" aria-label="Line type" className="flex gap-1">
                    {(
                      [
                        { value: "costings", label: "Costings", icon: IconCalculator, count: values.costings.length, allowed: canPickCostings },
                        { value: "sellings", label: "Sellings", icon: IconTag, count: values.sellings.length, allowed: canPickSellings },
                      ] as const
                    )
                      .filter((tab) => tab.allowed)
                      .map((tab) => {
                        const active = lineTab === tab.value
                        const Icon = tab.icon
                        return (
                          <button
                            key={tab.value}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            onClick={() => setLineTab(tab.value)}
                            className={cn(
                              "flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors",
                              active ? "brand-fill" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <Icon className="size-3.5" />
                            {tab.label}
                            {tab.count ? <span className="tabular-nums opacity-80">· {tab.count}</span> : null}
                          </button>
                        )
                      })}
                  </div>
                  {lineTab === "costings" && canPickCostings ? (
                    <SalesLinePicker
                      kind="costings"
                      selected={values.costings}
                      onChange={(costings) => setValues((current) => ({ ...current, costings }))}
                      enabled={open && linesOpen}
                      onCreate={canCreateCostings ? (description) => setCreating({ kind: "costings", description }) : undefined}
                    />
                  ) : canPickSellings ? (
                    <SalesLinePicker
                      kind="sellings"
                      selected={values.sellings}
                      onChange={(sellings) => setValues((current) => ({ ...current, sellings }))}
                      enabled={open && linesOpen}
                      onCreate={canCreateSellings ? (description) => setCreating({ kind: "sellings", description }) : undefined}
                    />
                  ) : null}
                  {createdCount ? (
                    <p className="px-1 text-xs text-muted-foreground">
                      New lines are saved straight away. If you cancel this job, they stay as lines without a sales job.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>
          ) : null}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : mode === "create" ? "Create sales job" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>

        {creating?.kind === "costings" ? (
          <CostingFormDialog
            mode="create"
            defaultOpen
            trigger={<span hidden />}
            defaultDescription={creating.description}
            pendingSalesJob="This new sales job, once it's created"
            onSaved={(costing) => pickNew("costings", costingToLine(costing))}
            onOpenChange={(next) => !next && setCreating(null)}
          />
        ) : null}
        {creating?.kind === "sellings" ? (
          <SellingFormDialog
            mode="create"
            defaultOpen
            trigger={<span hidden />}
            defaultDescription={creating.description}
            pendingSalesJob="This new sales job, once it's created"
            onSaved={(selling) => pickNew("sellings", sellingToLine(selling))}
            onOpenChange={(next) => !next && setCreating(null)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

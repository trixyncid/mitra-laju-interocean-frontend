"use client"

import { useState, type ReactNode } from "react"
import {
  IconAlertTriangle,
  IconCalculator,
  IconChevronRight,
  IconCircleCheck,
  IconCornerDownRight,
  IconFileInvoice,
  IconLink,
  IconLinkOff,
  IconTag,
} from "@tabler/icons-react"

import { RecordLink } from "@/components/record-link"
import { CostingFormDialog } from "@/components/costings/costing-form-dialog"
import { SalesInvoicesSection } from "@/components/customer-invoices/sales-invoices-section"
import { INVOICE_STATUS_TONE, invoiceTotals } from "@/components/customer-invoices/invoice-format"
import { formatIdr } from "@/components/dashboard/overview-card"
import { AddLinesDialog } from "@/components/sales/add-lines-dialog"
import type { SalesLineKind } from "@/components/sales/sales-line-picker"
import { SellingFormDialog } from "@/components/sellings/selling-form-dialog"
import { formatPercent, linkedCostingLabel, THIN_MARGIN_PERCENT } from "@/components/sellings/selling-margin"
import { Button } from "@/components/ui/button"
import { useUnlinkSalesLine } from "@/hooks/use-sales"
import { usePermissions } from "@/hooks/use-permissions"
import { CUSTOMER_INVOICE_MODULE_ENABLED } from "@/lib/feature-flags"
import type { Sales, SalesCosting, SalesSelling } from "@/lib/types/sales"
import { cn, vendorInvoiceLineGross } from "@/lib/utils"

type Stage = "costs" | "sellings" | "invoices"

/**
 * One "Link" button per list: it lists lines not in any job yet, with a way
 * to create a new one. Without pick access it goes straight to the form.
 */
function AddLinesButton({
  sales,
  kind,
  canPickLines,
  canCreateLines,
}: {
  sales: Sales
  kind: SalesLineKind
  canPickLines: boolean
  canCreateLines: boolean
}) {
  const [step, setStep] = useState<"closed" | "pick" | "create">("closed")
  const label = kind === "sellings" ? "Link selling" : "Link costing"
  const close = (open: boolean) => !open && setStep("closed")
  // Hidden trigger: the form opens itself and unmounts when closed.
  const hiddenTrigger = <span hidden />

  return (
    <>
      <Button size="sm" onClick={() => setStep(canPickLines ? "pick" : "create")}>
        <IconLink className="size-4" />
        {label}
      </Button>
      {step === "pick" ? (
        <AddLinesDialog
          sales={sales}
          kind={kind}
          open
          onOpenChange={close}
          onCreateNew={canCreateLines ? () => setStep("create") : undefined}
        />
      ) : null}
      {step === "create" && kind === "sellings" ? (
        <SellingFormDialog
          mode="create"
          defaultOpen
          defaultSalesId={sales.id}
          defaultSalesLabel={sales.salesNumber}
          trigger={hiddenTrigger}
          onOpenChange={close}
        />
      ) : null}
      {step === "create" && kind === "costings" ? (
        <CostingFormDialog
          mode="create"
          defaultOpen
          defaultSalesId={sales.id}
          defaultSalesLabel={sales.salesNumber}
          trigger={hiddenTrigger}
          onOpenChange={close}
        />
      ) : null}
    </>
  )
}

/** A stage of the money flow: what it is, how many, and whether it needs attention. */
function StageTab({
  id,
  active,
  icon,
  title,
  count,
  amount,
  status,
  onSelect,
}: {
  id: Stage
  active: boolean
  icon: ReactNode
  title: string
  count: number
  amount: string
  /** `short` replaces `text` on phones, where a tab is a third of the screen. */
  status: { tone: "ok" | "warn" | "muted"; text: string; short?: string }
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`job-stage-${id}`}
      aria-selected={active}
      aria-controls={`job-stage-panel-${id}`}
      tabIndex={active ? 0 : -1}
      onClick={onSelect}
      className={cn(
        "relative flex h-full w-full min-w-0 cursor-pointer flex-col items-start gap-0.5 rounded-xl border p-2.5 text-left sm:p-3 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30",
        active ? "border-primary bg-secondary shadow-sm" : "border-border bg-card hover:border-input hover:bg-muted/60"
      )}
    >
      <span className="flex w-full items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className={cn("hidden shrink-0 sm:inline", active && "text-primary")}>{icon}</span>
        <span className="truncate">{title}</span>
        <span className="ml-auto tabular-nums">{count}</span>
      </span>
      <span className="hidden w-full truncate text-sm font-semibold tabular-nums text-foreground sm:block">{amount}</span>
      <span
        className={cn(
          "flex w-full items-center gap-1 truncate text-[11px] font-medium",
          status.tone === "warn" && "text-[var(--mli-on-warning-container)]",
          status.tone === "ok" && "text-[var(--mli-on-success-container)]",
          status.tone === "muted" && "text-muted-foreground"
        )}
      >
        {status.tone === "warn" ? <IconAlertTriangle className="size-3.5 shrink-0" /> : null}
        {status.tone === "ok" ? <IconCircleCheck className="size-3.5 shrink-0" /> : null}
        {status.short ? (
          <>
            <span className="truncate sm:hidden">{status.short}</span>
            <span className="hidden truncate sm:inline">{status.text}</span>
          </>
        ) : (
          <span className="truncate">{status.text}</span>
        )}
      </span>
    </button>
  )
}

function PanelHeader({ title, hint, action }: { title: string; hint: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <div className="mr-auto min-w-0">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      {action}
    </div>
  )
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-lg bg-muted/70 px-3 py-6 text-center text-sm text-muted-foreground">{children}</p>
}

function UnlinkButton({ label, title, disabled, onClick }: { label: string; title: string; disabled: boolean; onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon-sm" aria-label={label} title={title} disabled={disabled} onClick={onClick}>
      <IconLinkOff className="size-4" />
    </Button>
  )
}

function CostLine({
  costing,
  sellingName,
  onUnlink,
  unlinking,
  nested,
}: {
  costing: SalesCosting
  /** Name of the selling it's charged on, when shown outside that selling. */
  sellingName?: string | null
  onUnlink?: () => void
  unlinking?: boolean
  nested?: boolean
}) {
  return (
    <li className={cn("flex items-center gap-2.5", nested ? "py-1.5" : "rounded-lg border border-border p-3")}>
      {nested ? <IconCornerDownRight className="size-4 shrink-0 text-muted-foreground/70" /> : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <RecordLink
            module="COSTING"
            href={`/dashboard/costings?costing=${costing.id}`}
            className={cn("min-w-32 flex-1 truncate text-foreground hover:underline", nested ? "text-[13px]" : "text-sm font-medium")}
          >
            {linkedCostingLabel(costing)}
          </RecordLink>
          <span className={cn("shrink-0 tabular-nums", nested ? "text-[13px] text-muted-foreground" : "text-sm font-medium")}>
            {formatIdr(vendorInvoiceLineGross(costing))}
          </span>
        </div>
        <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <span className="truncate">
            {costing.vendor.vendorName}
            {costing.costingSource === "VENDOR_INVOICE" ? " · from vendor invoice" : " · manual"}
          </span>
          {sellingName ? (
            <span className="shrink-0 truncate rounded-full bg-muted px-2 py-px text-[11px] font-medium">On: {sellingName}</span>
          ) : null}
        </p>
      </div>
      {onUnlink ? (
        <UnlinkButton
          label={`Remove ${linkedCostingLabel(costing)} from this job`}
          title="Remove from job"
          disabled={Boolean(unlinking)}
          onClick={onUnlink}
        />
      ) : null}
    </li>
  )
}

/** A selling with the costs it recovers tucked under it, and what it earns. */
function SellingCard({
  selling,
  costs,
  onUnlink,
  unlinking,
}: {
  selling: SalesSelling
  costs: SalesCosting[]
  onUnlink?: () => void
  unlinking: boolean
}) {
  const revenue = vendorInvoiceLineGross(selling)
  const cost = costs.reduce((sum, costing) => sum + vendorInvoiceLineGross(costing), 0)
  const profit = revenue - cost
  const percent = revenue > 0 ? (profit / revenue) * 100 : 0
  const tone = costs.length === 0 ? "muted" : profit < 0 ? "loss" : percent < THIN_MARGIN_PERCENT ? "thin" : "healthy"
  const costShare = revenue > 0 ? Math.min(100, (cost / revenue) * 100) : 100

  return (
    <li className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-start gap-3 p-3">
        <span className="mt-0.5 hidden size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary sm:flex">
          <IconTag className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <RecordLink
              module="SELLING"
              href={`/dashboard/sellings?selling=${selling.id}`}
              className="min-w-32 flex-1 truncate text-sm font-medium text-foreground hover:underline"
            >
              {selling.sellingDescription}
            </RecordLink>
            <span className="shrink-0 text-sm font-semibold tabular-nums">{formatIdr(revenue)}</span>
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
            <span className="truncate">
              {Number(selling.quantity).toLocaleString("id-ID")} ×{" "}
              {formatIdr(Number(selling.price) * Number(selling.currencyPrice))}
            </span>
            {CUSTOMER_INVOICE_MODULE_ENABLED ? (
              selling.customerInvoice ? (
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-px font-mono text-[11px] font-medium",
                    INVOICE_STATUS_TONE[selling.customerInvoice.customerInvoiceStatus]
                  )}
                  title={`Billed on ${selling.customerInvoice.customerInvoiceNumber}`}
                >
                  {selling.customerInvoice.customerInvoiceNumber}
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-muted px-2 py-px text-[11px] font-medium">Not billed</span>
              )
            ) : null}
          </p>
        </div>
        {onUnlink ? (
          <UnlinkButton
            label={`Remove ${selling.sellingDescription} from this job`}
            title={selling.customerInvoice ? "Billed on an invoice, remove it there first" : "Remove from job"}
            disabled={unlinking || Boolean(selling.customerInvoice)}
            onClick={onUnlink}
          />
        ) : null}
      </div>

      <div className="border-t border-border bg-muted/40 px-3 py-2.5">
        {costs.length ? (
          <>
            <ul aria-label={`Costs recovered by ${selling.sellingDescription}`}>
              {costs.map((costing) => (
                <CostLine key={costing.id} costing={costing} nested />
              ))}
            </ul>
            <div className="mt-2 flex items-center gap-3">
              <div
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--mli-success-container)]"
                role="img"
                aria-label={`Costs are ${Math.round(costShare)}% of this selling`}
              >
                <div
                  className={cn("h-full rounded-full", profit < 0 ? "bg-[var(--mli-negative)]" : "bg-primary")}
                  style={{ width: `${costShare}%` }}
                />
              </div>
              <span
                className={cn(
                  "shrink-0 text-xs font-medium tabular-nums",
                  tone === "loss" && "text-[var(--mli-negative)]",
                  tone === "thin" && "text-[var(--mli-on-warning-container)]",
                  tone === "healthy" && "text-[var(--mli-on-success-container)]"
                )}
              >
                Profit {formatIdr(profit)} · {formatPercent(percent)}
              </span>
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">No costs linked to this selling.</p>
        )}
      </div>
    </li>
  )
}

/**
 * The job's money in the order it moves: costs we pay, sellings we charge,
 * invoices we send. Each stage says at a glance if something needs doing.
 */
export function JobFlow({ sales }: { sales: Sales }) {
  const { can, canPick } = usePermissions()
  const unlinkCosting = useUnlinkSalesLine(sales.id, "costings")
  const unlinkSelling = useUnlinkSalesLine(sales.id, "sellings")
  const canEditJob = can("SALES", "edit")
  const showInvoices = CUSTOMER_INVOICE_MODULE_ENABLED && can("CUSTOMER_INVOICE", "view")
  const [picked, setPicked] = useState<Stage>("sellings")
  const stage = picked === "invoices" && !showInvoices ? "sellings" : picked

  const sellingIds = new Set(sales.sellings.map((selling) => selling.id))
  const sellingName = new Map(sales.sellings.map((selling) => [selling.id, selling.sellingDescription]))
  const notCharged = sales.costings.filter((costing) => !costing.sellingId)
  const charged = sales.costings.filter((costing) => costing.sellingId)
  const costTotal = sales.costings.reduce((sum, costing) => sum + vendorInvoiceLineGross(costing), 0)
  const notChargedTotal = notCharged.reduce((sum, costing) => sum + vendorInvoiceLineGross(costing), 0)
  const revenue = sales.sellings.reduce((sum, selling) => sum + vendorInvoiceLineGross(selling), 0)
  const notBilled = sales.sellings.filter((selling) => !selling.customerInvoice)
  const invoices = sales.customerInvoices ?? []
  const unpaid = invoices
    .filter((invoice) => invoice.customerInvoiceStatus === "UNPAID")
    .reduce((sum, invoice) => sum + invoiceTotals(sales.sellings.filter((line) => line.customerInvoice?.id === invoice.id)).due, 0)
  const billed = revenue - notBilled.reduce((sum, selling) => sum + vendorInvoiceLineGross(selling), 0)

  const stages: Stage[] = showInvoices ? ["costs", "sellings", "invoices"] : ["costs", "sellings"]
  const tabs: Record<Stage, Omit<Parameters<typeof StageTab>[0], "active" | "onSelect">> = {
    costs: {
      id: "costs",
      icon: <IconCalculator className="size-4" />,
      title: "Costs",
      count: sales.costings.length,
      amount: formatIdr(costTotal),
      status: !sales.costings.length
        ? { tone: "muted", text: "None yet" }
        : notCharged.length
          ? { tone: "warn", text: `${notCharged.length} not charged`, short: `${notCharged.length} to charge` }
          : { tone: "ok", text: "All charged" },
    },
    sellings: {
      id: "sellings",
      icon: <IconTag className="size-4" />,
      title: "Sellings",
      count: sales.sellings.length,
      amount: formatIdr(revenue),
      status: !sales.sellings.length
        ? { tone: "muted", text: "None yet" }
        : showInvoices && notBilled.length
          ? { tone: "warn", text: `${notBilled.length} not billed`, short: `${notBilled.length} to bill` }
          : { tone: "ok", text: showInvoices ? "All billed" : "Ready" },
    },
    invoices: {
      id: "invoices",
      icon: <IconFileInvoice className="size-4" />,
      title: "Invoices",
      count: invoices.length,
      amount: formatIdr(billed),
      status: !invoices.length
        ? { tone: "muted", text: "Nothing billed", short: "None yet" }
        : unpaid > 0
          ? { tone: "warn", text: `${formatIdr(unpaid)} unpaid`, short: "Unpaid" }
          : { tone: "ok", text: "All paid" },
    },
  }

  const select = (next: Stage, focus = false) => {
    setPicked(next)
    if (focus) document.getElementById(`job-stage-${next}`)?.focus()
  }

  const costAction =
    canEditJob && (canPick("COSTING") || can("COSTING", "create")) ? (
      <AddLinesButton sales={sales} kind="costings" canPickLines={canPick("COSTING")} canCreateLines={can("COSTING", "create")} />
    ) : null
  const sellingAction =
    canEditJob && (canPick("SELLING") || can("SELLING", "create")) ? (
      <AddLinesButton sales={sales} kind="sellings" canPickLines={canPick("SELLING")} canCreateLines={can("SELLING", "create")} />
    ) : null

  return (
    <section aria-label="Costs, sellings and invoices" className="space-y-3">
      <div
        role="tablist"
        aria-label="Job stages"
        className={cn("grid gap-1.5 sm:gap-2", stages.length === 3 ? "grid-cols-3" : "grid-cols-2")}
        onKeyDown={(event) => {
          const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0
          if (!step) return
          event.preventDefault()
          select(stages[(stages.indexOf(stage) + step + stages.length) % stages.length], true)
        }}
      >
        {stages.map((key, index) => (
          <div key={key} className="relative min-w-0">
            <StageTab {...tabs[key]} active={stage === key} onSelect={() => select(key)} />
            {/* Arrows read the stages as a flow: pay, charge, bill. */}
            {index < stages.length - 1 ? (
              <span
                aria-hidden
                className="absolute top-1/2 -right-2.5 z-10 hidden size-5 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground sm:flex"
              >
                <IconChevronRight className="size-3" />
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`job-stage-panel-${stage}`}
        aria-labelledby={`job-stage-${stage}`}
        className="rounded-xl border border-border p-4"
      >
        {stage === "sellings" ? (
          <div className="space-y-3">
            <PanelHeader
              title="What we charge the customer"
              hint={
                sales.sellings.length
                  ? "Each selling shows the costs it recovers and what it earns."
                  : "Nothing charged yet."
              }
              action={sellingAction}
            />
            {sales.sellings.length === 0 ? (
              <Empty>Link what the customer pays for this job.</Empty>
            ) : (
              <ul className="space-y-2.5">
                {sales.sellings.map((selling) => (
                  <SellingCard
                    key={selling.id}
                    selling={selling}
                    costs={sales.costings.filter((costing) => costing.sellingId === selling.id)}
                    onUnlink={canEditJob ? () => unlinkSelling.mutate(selling.id) : undefined}
                    unlinking={unlinkSelling.isPending}
                  />
                ))}
              </ul>
            )}
            {notCharged.length ? (
              <button
                type="button"
                onClick={() => select("costs")}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg bg-[var(--mli-warning-container)] px-3 py-2.5 text-left text-xs text-[var(--mli-on-warning-container)] hover:brightness-[0.98]"
              >
                <IconAlertTriangle className="size-4 shrink-0" />
                <span className="flex-1">
                  {notCharged.length} cost{notCharged.length === 1 ? " is" : "s are"} not charged on any selling (
                  {formatIdr(notChargedTotal)}).
                </span>
                <span className="font-medium">See costs</span>
                <IconChevronRight className="size-4" />
              </button>
            ) : null}
          </div>
        ) : null}

        {stage === "costs" ? (
          <div className="space-y-4">
            <PanelHeader title="What vendors charge us" hint="Before tax. Charge every cost on a selling so it's recovered." action={costAction} />
            {sales.costings.length === 0 ? (
              <Empty>No costs yet. Link what vendors charge for this job.</Empty>
            ) : (
              <>
                {notCharged.length ? (
                  <div className="space-y-2">
                    <p className="flex items-center gap-1.5 px-1 text-xs font-medium text-[var(--mli-on-warning-container)]">
                      <IconAlertTriangle className="size-3.5" />
                      Not charged yet · {formatIdr(notChargedTotal)}
                    </p>
                    <p className="px-1 text-xs text-muted-foreground">
                      These costs are not on any selling, so the customer is not paying for them. Link them from a selling.
                    </p>
                    <ul className="space-y-2">
                      {notCharged.map((costing) => (
                        <CostLine
                          key={costing.id}
                          costing={costing}
                          onUnlink={canEditJob ? () => unlinkCosting.mutate(costing.id) : undefined}
                          unlinking={unlinkCosting.isPending}
                        />
                      ))}
                    </ul>
                  </div>
                ) : null}
                {charged.length ? (
                  <div className="space-y-2">
                    <p className="flex items-center gap-1.5 px-1 text-xs font-medium text-muted-foreground">
                      <IconCircleCheck className="size-3.5" />
                      Charged on a selling
                    </p>
                    <ul className="space-y-2">
                      {charged.map((costing) => (
                        <CostLine
                          key={costing.id}
                          costing={costing}
                          sellingName={
                            costing.sellingId && sellingIds.has(costing.sellingId)
                              ? sellingName.get(costing.sellingId)
                              : "a selling in another job"
                          }
                          onUnlink={canEditJob ? () => unlinkCosting.mutate(costing.id) : undefined}
                          unlinking={unlinkCosting.isPending}
                        />
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        {stage === "invoices" ? <SalesInvoicesSection sales={sales} embedded /> : null}
      </div>
    </section>
  )
}

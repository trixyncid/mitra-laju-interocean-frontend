"use client"

import { useState } from "react"
import Link from "next/link"
import {
  IconArrowUpRight,
  IconPackages,
  IconPencil,
  IconShip,
  IconTrash,
  IconUser,
  IconX,
} from "@tabler/icons-react"

import { formatIdr } from "@/components/dashboard/overview-card"
import { JobFlow } from "@/components/sales/job-flow"
import { SalesFormDialog } from "@/components/sales/sales-form-dialog"
import { JOB_STATE_LABEL, salesPnl, type JobState } from "@/components/sales/sales-pnl"
import { ShipmentSummary } from "@/components/sales/shipment-picker"
import { formatPercent, MARGIN_TONE } from "@/components/sellings/selling-margin"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import { DeleteConfirmButton } from "@/components/ui/delete-confirm-button"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useDeleteSales, useSales } from "@/hooks/use-sales"
import { usePermissions } from "@/hooks/use-permissions"
import { formatShipmentStatus } from "@/lib/shipment-status"
import { shipmentReference } from "@/lib/shipment-reference"
import { SALES_TYPE_LABEL, type Sales } from "@/lib/types/sales"
import { cn, localDate } from "@/lib/utils"

const STATE_TONE: Record<JobState, string> = { ...MARGIN_TONE, nothing: MARGIN_TONE.uncosted }

function DeleteSalesButton({ sales, onDeleted }: { sales: Sales; onDeleted?: () => void }) {
  const [open, setOpen] = useState(false)
  const remove = useDeleteSales()
  const invoiced = sales._count.customerInvoices > 0
  const lines = sales.costings.length + sales.sellings.length
  return (
    <Dialog open={open} onOpenChange={(next) => !remove.isPending && setOpen(next)}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Delete sales job" title="Delete sales job">
          <IconTrash className="text-[var(--mli-on-error-container)]" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{invoiced ? "This job can't be deleted" : `Delete ${sales.salesNumber}?`}</DialogTitle>
          <DialogDescription>
            {invoiced
              ? `It has ${sales._count.customerInvoices} customer invoice${sales._count.customerInvoices === 1 ? "" : "s"}. Delete ${sales._count.customerInvoices === 1 ? "it" : "them"} first.`
              : [
                  "The job will be removed.",
                  sales.shipment ? ` Shipment ${shipmentReference(sales.shipment)} will be free to use in another job.` : "",
                  lines ? ` Its ${lines} line${lines === 1 ? "" : "s"} are kept and can join another job.` : "",
                ].join("")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={remove.isPending}>
              {invoiced ? "Close" : "Cancel"}
            </Button>
          </DialogClose>
          {invoiced ? null : (
            <DeleteConfirmButton
              isPending={remove.isPending}
              onClick={() => remove.mutate(sales.id, { onSuccess: () => { setOpen(false); onDeleted?.() } })}
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SalesPanel({
  salesId,
  onClose,
  onDeleted,
  showOpenFullPage = true,
  className,
}: {
  salesId: string
  onClose?: () => void
  onDeleted?: () => void
  showOpenFullPage?: boolean
  className?: string
}) {
  const { data: sales, isLoading, error } = useSales(salesId)
  const { can, canRead, canView } = usePermissions()

  if (isLoading) {
    return (
      <div className={cn("space-y-5 p-6", className)}>
        <Skeleton className="h-12 w-2/3 rounded-full" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }
  if (error || !sales) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3 p-10 text-center", className)}>
        <p className="text-sm text-muted-foreground">{error?.message ?? "This sales job could not be loaded."}</p>
        {onClose ? <Button variant="outline" onClick={onClose}>Close</Button> : null}
      </div>
    )
  }

  const { revenue, cost, margin, percent, state } = salesPnl(sales)
  const costShare = revenue > 0 ? Math.min(100, (cost / revenue) * 100) : cost > 0 ? 100 : 0
  const customer = sales.customer
  const shipment = sales.shipment
  const op = shipment?.shipmentOperational
  const canEditJob = can("SALES", "edit")
  const TypeIcon = sales.salesType === "SHIPMENT" ? IconShip : IconPackages

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <header className="border-b border-border p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl brand-fill">
              <TypeIcon className="size-6" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h2 className="font-mono text-base font-semibold tracking-[-0.01em] text-foreground sm:text-xl">
                  {/* Narrow screens wrap after a slash, never mid-segment. */}
                  {sales.salesNumber.split("/").map((part, index) => (
                    <span key={index}>
                      {index ? <wbr /> : null}
                      {index ? "/" : ""}
                      {part}
                    </span>
                  ))}
                </h2>
                <CopyButton value={sales.salesNumber} label="Sales number" />
              </div>
              <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                <IconUser className="size-4 shrink-0" />
                {customer && canView("CUSTOMER") ? (
                  <Link href={`/dashboard/customers/${customer.id}`} className="truncate hover:text-foreground hover:underline">
                    {customer.customerName} ({customer.customerCode})
                  </Link>
                ) : (
                  <span className="truncate">{customer ? `${customer.customerName} (${customer.customerCode})` : "No customer"}</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {showOpenFullPage ? (
              <Button asChild variant="ghost" size="icon" aria-label="Open full page" title="Open full page">
                <Link href={`/dashboard/sales/${sales.id}`}>
                  <IconArrowUpRight />
                </Link>
              </Button>
            ) : null}
            {can("SALES", "delete") ? <DeleteSalesButton sales={sales} onDeleted={onDeleted} /> : null}
            {onClose ? (
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close details">
                <IconX />
              </Button>
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            {SALES_TYPE_LABEL[sales.salesType]}
          </span>
          <span className={cn("rounded-full px-3 py-1 text-xs font-medium", STATE_TONE[state])}>
            {state === "nothing" ? JOB_STATE_LABEL.nothing : `${JOB_STATE_LABEL[state]} · ${formatPercent(percent)}`}
          </span>
          {canEditJob ? (
            <SalesFormDialog
              mode="edit"
              sales={sales}
              trigger={
                <Button variant="outline" size="sm">
                  <IconPencil className="size-4" />
                  Edit job
                </Button>
              }
            />
          ) : null}
          {sales.updatedBy?.name ? (
            <p className="ml-auto text-xs text-muted-foreground">
              Updated {localDate(sales.updatedAt)} by {sales.updatedBy.name}
            </p>
          ) : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
        {shipment ? (
          <section aria-label="Shipment" className="flex flex-wrap items-center gap-3 rounded-xl bg-muted/70 p-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-muted-foreground">
              <IconShip className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <ShipmentSummary shipment={shipment} />
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {formatShipmentStatus(shipment.status)}
                {op?.vessel?.voyageNumber ? ` · Voyage ${op.vessel.voyageNumber}` : ""}
                {op?.blNumber ? ` · BL ${op.blNumber}` : ""}
              </p>
            </div>
            {canRead("shipments") ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/shipments?shipment=${shipment.id}`}>
                  Open shipment
                  <IconArrowUpRight className="size-4" />
                </Link>
              </Button>
            ) : null}
          </section>
        ) : null}

        <section aria-label="Profit" className="@container rounded-xl border border-border p-4">
          <div>
            <h3 className="text-sm font-medium text-foreground">Job profit</h3>
            <p className="text-xs text-muted-foreground">Before tax: sellings minus costings</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm @xl:grid-cols-4 [&_p]:break-words">
            <div>
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="font-medium tabular-nums">{formatIdr(revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cost</p>
              <p className="font-medium tabular-nums">{formatIdr(cost)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Profit</p>
              <p
                className={cn(
                  "font-semibold tabular-nums",
                  margin < 0 && "text-[var(--mli-negative)]",
                  state === "healthy" && "text-[var(--mli-positive)]"
                )}
              >
                {formatIdr(margin)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Margin</p>
              <p className="font-medium tabular-nums">{state === "nothing" ? "—" : formatPercent(percent)}</p>
            </div>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--mli-success-container)]"
            role="img"
            aria-label={`Cost is ${Math.round(costShare)}% of revenue`}
          >
            <div
              className={cn("h-full rounded-full", margin < 0 ? "bg-[var(--mli-negative)]" : "bg-primary")}
              style={{ width: `${costShare}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Bar: cost as a share of revenue; the green remainder is profit.</p>
        </section>

        <JobFlow sales={sales} />
      </div>
    </div>
  )
}

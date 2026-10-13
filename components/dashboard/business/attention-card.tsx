"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import {
  IconAnchor,
  IconChevronRight,
  IconCircleCheck,
  IconFileInvoice,
  IconLinkOff,
  IconReceiptOff,
  IconShipOff,
  IconUnlink,
} from "@tabler/icons-react"

import type { BusinessData } from "@/app/dashboard/dashboard-types"
import { formatIdrCompact, OverviewCard } from "@/components/dashboard/overview-card"
import { usePermissions } from "@/hooks/use-permissions"
import type { AppModule } from "@/lib/permissions"
import { cn } from "@/lib/utils"

type Item = {
  key: string
  icon: ReactNode
  title: string
  detail: string
  amount?: string
  /** "money" leaks cost us; "work" holds things up. */
  tone: "money" | "work"
  href: string
  module: AppModule
}

const plural = (count: number, one: string, many = `${one}s`) => `${count.toLocaleString("id-ID")} ${count === 1 ? one : many}`

/** Things that lose money or hold up work, most costly first. Empty means all clear. */
export function AttentionCard({ attention }: { attention: BusinessData["attention"] }) {
  const { canView } = usePermissions()
  const items: Item[] = []
  const a = attention

  if (a.costsNotCharged?.count) {
    items.push({
      key: "not-charged",
      icon: <IconReceiptOff className="size-4" />,
      title: "Costs the customer isn't paying for",
      detail: `${plural(a.costsNotCharged.count, "cost")} in sales jobs are not on any selling.`,
      amount: a.costsNotCharged.amount,
      tone: "money",
      href: "/dashboard/sales",
      module: "SALES",
    })
  }
  if (a.readyToBill?.count) {
    items.push({
      key: "ready-to-bill",
      icon: <IconFileInvoice className="size-4" />,
      title: "Ready to bill",
      detail: `${plural(a.readyToBill.count, "selling")} not on a customer invoice yet.`,
      amount: a.readyToBill.amount,
      tone: "money",
      href: "/dashboard/customer-invoices",
      module: "CUSTOMER_INVOICE",
    })
  }
  if (a.finishedNotInvoiced) {
    items.push({
      key: "finished",
      icon: <IconShipOff className="size-4" />,
      title: "Finished but not invoiced",
      detail: `${plural(a.finishedNotInvoiced, "finished shipment")} with no customer invoice.`,
      tone: "money",
      href: "/dashboard/shipments",
      module: "SHIPMENT",
    })
  }
  if (a.unmatchedVendorLines?.lines) {
    items.push({
      key: "unmatched",
      icon: <IconUnlink className="size-4" />,
      title: "Vendor bills without a costing",
      detail: `${plural(a.unmatchedVendorLines.lines, "vendor invoice line")} not matched to any cost.`,
      amount: a.unmatchedVendorLines.amount,
      tone: "money",
      href: "/dashboard/vendor-invoices",
      module: "VENDOR_INVOICE",
    })
  }
  if (a.overdueArrivals) {
    items.push({
      key: "overdue",
      icon: <IconAnchor className="size-4" />,
      title: "Past arrival date",
      detail: `${plural(a.overdueArrivals, "ongoing shipment")} should have arrived already.`,
      tone: "work",
      href: "/dashboard/shipments",
      module: "SHIPMENT",
    })
  }
  const loose = (a.looseCostings ?? 0) + (a.looseSellings ?? 0)
  if (loose) {
    const parts = [
      a.looseCostings ? plural(a.looseCostings, "costing") : null,
      a.looseSellings ? plural(a.looseSellings, "selling") : null,
    ].filter(Boolean)
    items.push({
      key: "loose",
      icon: <IconLinkOff className="size-4" />,
      title: "Not in any sales job",
      detail: `${parts.join(" and ")} waiting to be linked to a job.`,
      tone: "work",
      href: "/dashboard/sales",
      module: "SALES",
    })
  }

  return (
    <OverviewCard
      className="h-full"
      title="Needs attention"
      description={items.length ? "Fix these to stop money slipping through." : "Nothing is slipping through right now."}
    >
      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-[var(--mli-success-container)] text-[var(--mli-on-success-container)]">
            <IconCircleCheck className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground">All costs are charged, all sellings billed.</p>
        </div>
      ) : (
        <ul className="-mx-2 flex flex-col">
          {items.map((item) => {
            const content = (
              <>
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                    item.tone === "money"
                      ? "bg-[var(--mli-warning-container)] text-[var(--mli-on-warning-container)]"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{item.title}</span>
                    {item.amount ? (
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{formatIdrCompact(item.amount)}</span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-muted-foreground">{item.detail}</span>
                </span>
              </>
            )
            return (
              <li key={item.key}>
                {canView(item.module) ? (
                  <Link
                    href={item.href}
                    className="group flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20"
                  >
                    {content}
                    <IconChevronRight className="mt-2 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <div className="flex items-start gap-3 px-2 py-2.5">{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </OverviewCard>
  )
}

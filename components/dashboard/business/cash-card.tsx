"use client"

import type { BusinessAgingBucket, BusinessData } from "@/app/dashboard/dashboard-types"
import { formatIdr, formatIdrCompact, OverviewCard } from "@/components/dashboard/overview-card"
import { cn } from "@/lib/utils"

/** One hue, light to dark: the older the money, the darker (and more worrying) it gets. */
const AGE_SHADES = ["#b9d3ef", "#6ea4dc", "#2f6fbf", "#123f7a"]

function AgingBar({ aging, label }: { aging: BusinessAgingBucket[]; label: string }) {
  const total = aging.reduce((sum, bucket) => sum + Number(bucket.amount), 0)
  return (
    <div>
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${label} by age`}>
        {total > 0
          ? aging.map((bucket, index) =>
              Number(bucket.amount) > 0 ? (
                <div
                  key={bucket.key}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${(Number(bucket.amount) / total) * 100}%`, backgroundColor: AGE_SHADES[index] }}
                  title={`${bucket.label}: ${formatIdr(bucket.amount)}`}
                />
              ) : null
            )
          : null}
      </div>
      <dl className="mt-3 grid gap-y-1.5 text-[13px]">
        {aging.map((bucket, index) => (
          <div key={bucket.key} className="flex items-center justify-between gap-2">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: AGE_SHADES[index] }} />
              {bucket.label}
            </dt>
            <dd
              className={cn(
                "font-medium tabular-nums",
                index === aging.length - 1 && Number(bucket.amount) > 0 ? "text-[var(--mli-negative)]" : "text-foreground"
              )}
            >
              {formatIdrCompact(bucket.amount)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Side({
  title,
  amount,
  invoices,
  aging,
  note,
}: {
  title: string
  amount: string
  invoices: number
  aging: BusinessAgingBucket[]
  note?: string
}) {
  const old = Number(aging[aging.length - 1]?.amount ?? 0)
  return (
    <div className="min-w-0 space-y-3">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-0.5 text-2xl font-medium tracking-[-0.02em] tabular-nums" title={formatIdr(amount)}>
          {formatIdrCompact(amount)}
        </p>
        <p className="text-[13px] text-muted-foreground">
          {invoices} unpaid invoice{invoices === 1 ? "" : "s"}
          {old > 0 ? <span className="text-[var(--mli-negative)]"> · {formatIdrCompact(old)} over 90 days</span> : null}
        </p>
      </div>
      <AgingBar aging={aging} label={title} />
      {note ? <p className="text-[13px] text-muted-foreground">{note}</p> : null}
    </div>
  )
}

/** Money owed both ways, by age, and how cash moved in the period. */
export function CashCard({
  receivables,
  payables,
}: {
  receivables: BusinessData["receivables"]
  payables: BusinessData["payables"]
}) {
  const received = receivables ? Number(receivables.collected) : 0
  const paid = payables ? Number(payables.paid) : 0
  const net = received - paid

  return (
    <OverviewCard
      className="h-full"
      title="Cash position"
      description="Unpaid invoices by how long they have been waiting. Amounts include tax."
    >
      <div className={cn("grid gap-6", receivables && payables && "md:grid-cols-2 md:gap-8")}>
        {receivables ? (
          <Side
            title="Customers owe us"
            amount={receivables.outstanding}
            invoices={receivables.invoices}
            aging={receivables.aging}
            note={
              receivables.averageDaysToCollect !== null
                ? `Customers paid in ${receivables.averageDaysToCollect} days on average this period.`
                : undefined
            }
          />
        ) : null}
        {payables ? (
          <Side title="We owe vendors" amount={payables.outstanding} invoices={payables.invoices} aging={payables.aging} />
        ) : null}
      </div>

      {receivables && payables ? (
        <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl bg-muted/70 p-3 text-center sm:p-4">
          <div>
            <p className="text-xs text-muted-foreground">Received</p>
            <p className="font-medium tabular-nums text-[var(--mli-positive)]">+{formatIdrCompact(received)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Paid out</p>
            <p className="font-medium tabular-nums">−{formatIdrCompact(paid)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Net this period</p>
            <p className={cn("font-semibold tabular-nums", net < 0 ? "text-[var(--mli-negative)]" : "text-[var(--mli-positive)]")}>
              {net < 0 ? "−" : "+"}
              {formatIdrCompact(Math.abs(net))}
            </p>
          </div>
        </div>
      ) : null}
    </OverviewCard>
  )
}

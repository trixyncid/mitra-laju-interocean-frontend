"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { IconArrowUpRight, IconCash, IconChartBar, IconReceipt, IconTruckDelivery } from "@tabler/icons-react"

import type { BusinessData } from "@/app/dashboard/dashboard-types"
import { DeltaBadge, formatIdrCompact, percentChange } from "@/components/dashboard/overview-card"
import { cn } from "@/lib/utils"

function Tile({
  icon,
  label,
  value,
  fullValue,
  delta,
  footer,
  href,
  hero,
}: {
  icon: ReactNode
  label: string
  value: string
  fullValue: string
  delta?: number | null
  footer: ReactNode
  href?: string
  hero?: boolean
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-full sm:size-10",
            hero ? "bg-white/15 text-white" : "bg-muted text-foreground"
          )}
        >
          {icon}
        </span>
        {href ? (
          <IconArrowUpRight
            className={cn("size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5", hero ? "text-white/70" : "text-muted-foreground")}
          />
        ) : null}
      </div>
      <p className={cn("mt-3 text-[13px] sm:mt-4 sm:text-sm", hero ? "text-white/80" : "text-muted-foreground")}>{label}</p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <p className="text-[22px] font-medium leading-none tracking-[-0.03em] tabular-nums sm:text-[30px]" title={fullValue}>
          {value}
        </p>
        {delta !== undefined ? (
          <DeltaBadge value={delta} className={hero ? "text-white [&_*]:text-white" : undefined} />
        ) : null}
      </div>
      <div className={cn("mt-2 text-xs sm:mt-3 sm:text-[13px]", hero ? "text-white/80" : "text-muted-foreground")}>{footer}</div>
    </>
  )
  const className = cn(
    "group flex min-w-0 flex-col rounded-2xl p-4 transition-shadow sm:p-5",
    hero ? "brand-fill text-white shadow-[0_16px_40px_rgba(24,81,155,0.28)]" : "surface text-foreground",
    href && "hover:shadow-[0_12px_32px_rgba(var(--mli-ink-rgb),0.10)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20"
  )
  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}

const full = (value: string | number) =>
  Number(value).toLocaleString("id-ID", { style: "currency", currency: "IDR" })

/** The four numbers an owner asks first: what we sold, what we kept, who owes us, whom we owe. */
export function BusinessKpis({
  data,
  links,
}: {
  data: BusinessData
  links: { sales?: string; receivables?: string; payables?: string }
}) {
  const { profit, receivables, payables } = data
  const tiles: ReactNode[] = []

  if (profit) {
    const { current, previous } = profit
    tiles.push(
      <Tile
        key="revenue"
        icon={<IconChartBar className="size-5" />}
        label="Revenue"
        value={formatIdrCompact(current.revenue)}
        fullValue={full(current.revenue)}
        delta={percentChange(Number(current.revenue), Number(previous.revenue))}
        footer={`From ${current.jobs.toLocaleString("id-ID")} sales job${current.jobs === 1 ? "" : "s"} · before tax`}
        href={links.sales}
      />,
      <Tile
        key="profit"
        hero
        icon={<IconCash className="size-5" />}
        label="Gross profit"
        value={formatIdrCompact(current.profit)}
        fullValue={full(current.profit)}
        delta={percentChange(Number(current.profit), Number(previous.profit))}
        footer={
          current.margin === null
            ? "No revenue yet in this timeframe"
            : `We keep ${current.margin.toLocaleString("id-ID")}% of every rupiah sold`
        }
        href={links.sales}
      />
    )
  }
  if (receivables) {
    tiles.push(
      <Tile
        key="collect"
        icon={<IconReceipt className="size-5" />}
        label="To collect from customers"
        value={formatIdrCompact(receivables.outstanding)}
        fullValue={full(receivables.outstanding)}
        footer={
          <>
            {receivables.invoices} unpaid invoice{receivables.invoices === 1 ? "" : "s"} ·{" "}
            <span className="text-[var(--mli-positive)]">{formatIdrCompact(receivables.collected)} received</span> this period
          </>
        }
        href={links.receivables}
      />
    )
  }
  if (payables) {
    tiles.push(
      <Tile
        key="pay"
        icon={<IconTruckDelivery className="size-5" />}
        label="To pay vendors"
        value={formatIdrCompact(payables.outstanding)}
        fullValue={full(payables.outstanding)}
        footer={`${payables.invoices} unpaid vendor invoice${payables.invoices === 1 ? "" : "s"} · ${formatIdrCompact(payables.paid)} paid this period`}
        href={links.payables}
      />
    )
  }

  if (!tiles.length) return null
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5", tiles.length >= 4 ? "xl:grid-cols-4" : tiles.length === 3 ? "xl:grid-cols-3" : "")}>
      {tiles}
    </div>
  )
}

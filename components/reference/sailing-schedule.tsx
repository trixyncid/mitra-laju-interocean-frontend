"use client"

import { addDays, differenceInCalendarDays, format, startOfWeek } from "date-fns"
import {
  IconCalendarQuestion,
  IconAnchor,
  IconClockHour4,
  IconShip,
  IconSnowflake,
} from "@tabler/icons-react"

import VesselActionCell from "@/components/action-cell/vessel-action-cell"
import type { Vessel } from "@/app/dashboard/vessels/columns"
import { parseLocalDate } from "@/lib/date-input"
import { cn } from "@/lib/utils"
import { vesselLabel } from "@/lib/shipment-reference"

type Bucket = "this-week" | "next-week" | "later" | "no-date" | "left"

const BUCKETS: { key: Bucket; title: string; hint: string }[] = [
  { key: "this-week", title: "This week", hint: "Leaving in the next few days" },
  { key: "next-week", title: "Next week", hint: "Plan cargo and reefer now" },
  { key: "later", title: "Later", hint: "Further ahead" },
  { key: "no-date", title: "No departure date yet", hint: "Add the ETD when it is known" },
  { key: "left", title: "Already left", hint: "Departure date has passed" },
]

const dayFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric" })
// date-fns for short months: some browsers write September as "Sept".
const monthFormat = { format: (date: Date) => format(date, "MMM") }
const weekdayFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short" })
const longFormat = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" })
const shortFormat = { format: (date: Date) => format(date, "EEE, d MMM") }

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)
}

function bucketFor(etd: Date | undefined, today: Date): Bucket {
  if (!etd) return "no-date"
  if (differenceInCalendarDays(etd, today) < 0) return "left"
  const nextWeek = startOfWeek(addDays(today, 7), { weekStartsOn: 1 })
  if (etd < nextWeek) return "this-week"
  if (etd < addDays(nextWeek, 7)) return "next-week"
  return "later"
}

/** "today", "tomorrow", "in 3 days", "2 days ago". */
export function relativeDays(days: number) {
  if (days === 0) return "today"
  if (days === 1) return "tomorrow"
  if (days === -1) return "yesterday"
  return days > 0 ? `in ${days} days` : `${-days} days ago`
}

function ReeferMarker({ closing, today }: { closing: Date | undefined; today: Date }) {
  if (!closing) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary">
        <IconSnowflake className="size-3.5" />
        Reefer closing: TBD
      </span>
    )
  }
  const days = differenceInCalendarDays(closing, today)
  const urgent = days >= 0 && days <= 2
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        days < 0
          ? "bg-muted text-muted-foreground"
          : urgent
            ? "bg-[var(--mli-warning-container)] text-[var(--mli-on-warning-container)]"
            : "bg-[var(--mli-import-container)] text-[var(--mli-on-import-container)]"
      )}
    >
      <IconSnowflake className="size-3.5" />
      {days < 0 ? "Reefer closed" : `Reefer closes ${shortFormat.format(closing)}`}
    </span>
  )
}

function DateBlock({ date, muted }: { date: Date | undefined; muted?: boolean }) {
  if (!date) {
    return (
      <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl surface-inset text-muted-foreground">
        <IconCalendarQuestion className="size-5" />
        <span className="mt-0.5 text-[10px] font-medium uppercase">TBD</span>
      </div>
    )
  }
  return (
    <div
      className={cn(
        "flex size-14 shrink-0 flex-col items-center justify-center rounded-xl leading-none",
        muted ? "surface-inset text-muted-foreground" : "bg-secondary text-primary"
      )}
    >
      <span className="text-[10px] font-semibold uppercase">{monthFormat.format(date)}</span>
      <span className="mt-0.5 text-xl font-semibold tabular-nums">{dayFormat.format(date)}</span>
      <span className="mt-0.5 text-[10px] font-medium">{weekdayFormat.format(date)}</span>
    </div>
  )
}

function VoyageRow({ vessel, today, past }: { vessel: Vessel; today: Date; past: boolean }) {
  const etd = parseLocalDate(vessel.etd)
  const eta = parseLocalDate(vessel.eta)
  const closing = parseLocalDate(vessel.closingReefer)
  const days = etd ? differenceInCalendarDays(etd, today) : null
  return (
    <li
      className={cn(
        "group flex items-start gap-3 rounded-xl p-3 sm:items-center sm:gap-4",
        past ? "opacity-70" : "surface surface-lift"
      )}
    >
      <DateBlock date={etd} muted={past || !vessel.isActive} />
      <div className="min-w-0 flex-1 self-center">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("truncate text-sm font-semibold", vessel.isActive ? "text-foreground" : "text-muted-foreground")}>
            {vesselLabel(vessel)}
          </p>
          {!vessel.isActive ? (
            <span className="rounded-full bg-[var(--mli-error-container)] px-2 py-0.5 text-[11px] font-medium text-[var(--mli-on-error-container)]">
              Not in use
            </span>
          ) : null}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {past ? null : <ReeferMarker closing={closing} today={today} />}
          {days !== null ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <IconClockHour4 className="size-3.5" />
              {past ? `Left ${relativeDays(days)}` : `Leaves ${relativeDays(days)}`}
            </span>
          ) : null}
          {eta ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <IconAnchor className="size-3.5" />
              Arrives {shortFormat.format(eta)}
              {etd && eta >= etd ? ` · ${differenceInCalendarDays(eta, etd)} days at sea` : ""}
            </span>
          ) : null}
        </div>
      </div>
      <div className="shrink-0 transition-opacity max-sm:[&>div]:flex-col max-sm:[&>div]:gap-1 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 [@media(hover:none)]:opacity-100">
        <VesselActionCell row={{ original: vessel }} />
      </div>
    </li>
  )
}

function NextDeparture({ vessel, today }: { vessel: Vessel; today: Date }) {
  const etd = parseLocalDate(vessel.etd)!
  const days = differenceInCalendarDays(etd, today)
  const eta = parseLocalDate(vessel.eta)
  const closing = parseLocalDate(vessel.closingReefer)
  const closingDays = closing ? differenceInCalendarDays(closing, today) : null
  return (
    <div className="relative overflow-hidden rounded-2xl brand-fill p-5 text-primary-foreground sm:p-6">
      <IconShip
        aria-hidden
        className="pointer-events-none absolute -right-6 -bottom-8 size-44 text-primary-foreground/10"
        stroke={1.2}
      />
      <p className="text-xs font-medium tracking-wide text-primary-foreground/75 uppercase">Next departure</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {days === 0 ? "Leaves today" : days === 1 ? "Leaves tomorrow" : `Leaves in ${days} days`}
      </p>
      <p className="mt-1 text-sm text-primary-foreground/80">{longFormat.format(etd)}</p>
      <div className="relative mt-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-sm font-medium">
          <IconShip className="size-4" />
          {vesselLabel(vessel)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-xs font-medium">
          <IconAnchor className="size-3.5" />
          {eta ? `Arrives ${shortFormat.format(eta)}${eta >= etd ? ` · ${differenceInCalendarDays(eta, etd)} days at sea` : ""}` : "Arrival: TBD"}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1.5 text-xs font-medium">
          <IconSnowflake className="size-3.5" />
          {closing && closingDays !== null
            ? closingDays < 0
              ? "Reefer closed"
              : `Reefer closes ${relativeDays(closingDays)}`
            : "Reefer closing: TBD"}
        </span>
      </div>
    </div>
  )
}

export function SailingSchedule({ vessels, partial }: { vessels: Vessel[]; partial: boolean }) {
  const today = startOfToday()
  const rows = vessels.map((vessel) => ({ vessel, etd: parseLocalDate(vessel.etd) }))
  const grouped = new Map<Bucket, Vessel[]>()
  for (const { vessel, etd } of [...rows].sort((a, b) => (a.etd?.getTime() ?? Infinity) - (b.etd?.getTime() ?? Infinity))) {
    const bucket = bucketFor(etd, today)
    grouped.set(bucket, [...(grouped.get(bucket) ?? []), vessel])
  }
  // Most recent departures first in the past list.
  grouped.set("left", [...(grouped.get("left") ?? [])].reverse())

  const next = rows
    .filter(({ vessel, etd }) => vessel.isActive && etd && differenceInCalendarDays(etd, today) >= 0)
    .sort((a, b) => a.etd!.getTime() - b.etd!.getTime())[0]?.vessel

  const reeferSoon = rows.filter(({ vessel }) => {
    const closing = parseLocalDate(vessel.closingReefer)
    if (!closing) return false
    const days = differenceInCalendarDays(closing, today)
    return days >= 0 && days <= 3
  }).length

  const stats = [
    { label: "Leaving this week", value: grouped.get("this-week")?.length ?? 0 },
    { label: "Reefer closes in 3 days", value: reeferSoon },
    { label: "No ETD yet", value: grouped.get("no-date")?.length ?? 0 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {next ? (
          <NextDeparture vessel={next} today={today} />
        ) : (
          <div className="flex items-center gap-4 rounded-2xl surface-inset p-6">
            <IconShip className="size-10 text-muted-foreground" stroke={1.4} />
            <div>
              <p className="font-semibold text-foreground">No departures coming up</p>
              <p className="text-sm text-muted-foreground">Add a vessel with an ETD to see it here.</p>
            </div>
          </div>
        )}
        <dl className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-1">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col justify-center rounded-xl surface-inset px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <dt className="text-xs text-muted-foreground lg:text-sm">{stat.label}</dt>
              <dd className="mt-0.5 text-xl font-semibold tabular-nums text-foreground sm:text-2xl lg:mt-0">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      {partial ? (
        <p className="-mt-3 text-xs text-muted-foreground">This page shows part of the list. Use the pages below to see more.</p>
      ) : null}

      {BUCKETS.map(({ key, title, hint }) => {
        const list = grouped.get(key) ?? []
        if (list.length === 0) return null
        const past = key === "left"
        return (
          <section key={key} aria-label={title} className="relative">
            <header className="mb-3 flex items-baseline gap-3">
              <h2 className={cn("text-base font-semibold tracking-tight", past ? "text-muted-foreground" : "text-foreground")}>
                {title}
              </h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                {list.length}
              </span>
              <span className="hidden text-xs text-muted-foreground sm:inline">{hint}</span>
            </header>
            {/* The rail ties each week's departures together like a timetable. */}
            <ol className="relative space-y-2 border-l-2 border-dashed border-border pl-4 sm:pl-5">
              {list.map((vessel) => (
                <VoyageRow key={vessel.id ?? vessel.vesselName + vessel.voyageNumber} vessel={vessel} today={today} past={past} />
              ))}
            </ol>
          </section>
        )
      })}
    </div>
  )
}

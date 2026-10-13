"use client"

import { useState } from "react"
import { IconAnchor, IconWorld } from "@tabler/icons-react"

import PortActionCell from "@/components/action-cell/port-action-cell"
import { countryFlag } from "@/components/reference/country-flag"
import type { Port } from "@/app/dashboard/ports/columns"
import { cn } from "@/lib/utils"

type CountryGroup = { country: string; ports: Port[]; inactive: number }

function groupByCountry(ports: Port[]): CountryGroup[] {
  const map = new Map<string, Port[]>()
  for (const port of ports) {
    const country = port.portCountry?.trim() || "No country"
    map.set(country, [...(map.get(country) ?? []), port])
  }
  return [...map.entries()]
    .map(([country, list]) => ({
      country,
      ports: [...list].sort((a, b) => a.portName.localeCompare(b.portName)),
      inactive: list.filter((port) => !port.isActive).length,
    }))
    .sort((a, b) => b.ports.length - a.ports.length || a.country.localeCompare(b.country))
}

function Flag({ country, className }: { country: string; className?: string }) {
  const flag = countryFlag(country)
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full surface-inset leading-none",
        className
      )}
    >
      {flag ?? <IconWorld className="size-[55%] text-muted-foreground" />}
    </span>
  )
}

function PortTile({ port }: { port: Port }) {
  return (
    <li
      className={cn(
        "group relative flex items-center gap-3 rounded-xl p-3.5 transition-shadow",
        port.isActive
          ? "surface surface-lift"
          : "border border-dashed border-border bg-muted/40"
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          port.isActive
            ? "bg-secondary text-primary"
            : "bg-muted text-muted-foreground"
        )}
      >
        <IconAnchor className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-semibold",
            port.isActive ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {port.portName}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            aria-hidden
            className={cn(
              "size-1.5 rounded-full",
              port.isActive ? "bg-[var(--mli-on-success-container)]" : "bg-muted-foreground/50"
            )}
          />
          {port.isActive ? "In use" : "Not in use"}
        </p>
      </div>
      {/* Actions show on hover with a mouse, and always on touch screens. */}
      <div className="shrink-0 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 [@media(hover:none)]:opacity-100">
        <PortActionCell row={{ original: port }} />
      </div>
    </li>
  )
}

export function PortAtlas({ ports, partial }: { ports: Port[]; partial: boolean }) {
  const [selected, setSelected] = useState<string | null>(null)
  const groups = groupByCountry(ports)
  // A country that disappears after a new search falls back to "All".
  const current = groups.some((group) => group.country === selected) ? selected : null
  const visible = current ? groups.filter((group) => group.country === current) : groups
  const inactive = ports.filter((port) => !port.isActive).length

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: "Ports", value: ports.length },
          { label: "Countries", value: groups.length },
          { label: "Not in use", value: inactive },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl surface-inset px-3 py-3 sm:px-4">
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className="mt-0.5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
      {partial ? (
        <p className="-mt-2 text-xs text-muted-foreground">Numbers above count this page only.</p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-6">
        <nav aria-label="Countries" className="min-w-0">
          <p className="mb-2 hidden px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase lg:block">
            Countries
          </p>
          <ul className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {[{ country: null as string | null, count: ports.length }, ...groups.map((g) => ({ country: g.country as string | null, count: g.ports.length }))].map(
              (item) => {
                const active = current === item.country
                return (
                  <li key={item.country ?? "all"} className="shrink-0">
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelected(item.country)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2.5 rounded-full py-1.5 pr-3 pl-1.5 text-left text-sm whitespace-nowrap transition-colors lg:rounded-xl",
                        active
                          ? "brand-fill text-primary-foreground shadow-sm"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {item.country ? (
                        <Flag country={item.country} className={cn("size-7 text-base", active && "bg-primary-foreground/15")} />
                      ) : (
                        <span
                          aria-hidden
                          className={cn(
                            "flex size-7 items-center justify-center rounded-full",
                            active ? "bg-primary-foreground/15" : "surface-inset"
                          )}
                        >
                          <IconWorld className="size-4" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {item.country ?? "All countries"}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs tabular-nums",
                          active ? "bg-primary-foreground/15" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {item.count}
                      </span>
                    </button>
                  </li>
                )
              }
            )}
          </ul>
        </nav>

        <div className="min-w-0 space-y-6">
          {visible.map((group) => (
            <section key={group.country} aria-label={group.country}>
              <header className="mb-3 flex items-center gap-3">
                <Flag country={group.country} className="size-11 text-2xl" />
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold tracking-tight text-foreground">
                    {group.country}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {group.ports.length} {group.ports.length === 1 ? "port" : "ports"}
                    {group.inactive ? ` · ${group.inactive} not in use` : ""}
                  </p>
                </div>
              </header>
              <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {group.ports.map((port) => (
                  <PortTile key={port.id ?? port.portName} port={port} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

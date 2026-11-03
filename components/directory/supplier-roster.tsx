"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { IconFileAlert, IconFileCertificate } from "@tabler/icons-react"

import type { Vendor } from "@/app/dashboard/vendors/columns"
import { Monogram, updatedByName } from "@/components/directory/primitives"
import { ShipmentTypeTags } from "@/components/ui/shipment-type-tag"
import { cn, localDate } from "@/lib/utils"

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

function letterOf(name: string) {
  const first = name.trim().charAt(0).toUpperCase()
  return /[A-Z]/.test(first) ? first : "#"
}

function groupByLetter(vendors: Vendor[]) {
  const groups = new Map<string, Vendor[]>()
  for (const vendor of [...vendors].sort((a, b) => a.vendorName.localeCompare(b.vendorName))) {
    const letter = letterOf(vendor.vendorName)
    groups.set(letter, [...(groups.get(letter) ?? []), vendor])
  }
  return groups
}

function jumpTo(letter: string) {
  document.getElementById(`roster-${letter}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

function LetterRail({
  present,
  orientation,
}: {
  present: Set<string>
  orientation: "vertical" | "horizontal"
}) {
  const letters = present.has("#") ? [...ALPHABET, "#"] : ALPHABET
  return (
    <nav
      aria-label="Jump to letter"
      className={cn(
        orientation === "vertical"
          ? "flex flex-col items-center gap-0.5 rounded-full surface px-1 py-2"
          : "-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
      )}
    >
      {letters.map((letter) => {
        const enabled = present.has(letter)
        return (
          <button
            key={letter}
            type="button"
            disabled={!enabled}
            onClick={() => jumpTo(letter)}
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full font-semibold transition-colors",
              orientation === "vertical" ? "size-6 text-[11px]" : "size-8 text-xs",
              enabled
                ? "cursor-pointer text-primary hover:bg-primary hover:text-primary-foreground"
                : "cursor-default text-muted-foreground/35",
              orientation === "horizontal" && enabled && "bg-card shadow-elev-1"
            )}
          >
            {letter}
          </button>
        )
      })}
    </nav>
  )
}

export function RosterRow({
  vendor,
  actions,
  preview = false,
}: {
  vendor: Pick<Vendor, "id" | "vendorName" | "vendorCode" | "npwp" | "shipmentTypes" | "services" | "isActive" | "updatedAt" | "updatedBy">
  actions?: ReactNode
  preview?: boolean
}) {
  const updatedBy = updatedByName(vendor.updatedBy)
  const Root = preview ? "div" : "li"
  return (
    <Root className="group relative flex min-w-0 items-center gap-3 rounded-xl bg-card px-3 py-2.5 shadow-elev-1 transition-shadow hover:shadow-elev-2">
      <Monogram name={vendor.vendorName} shape="square" className="size-10 text-xs" />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          {preview ? (
            <span className={cn("truncate text-sm font-semibold", vendor.vendorName.trim() ? "text-foreground" : "text-muted-foreground")}>
              {vendor.vendorName.trim() || "Vendor name"}
            </span>
          ) : (
            <Link
              href={`/dashboard/vendors/${vendor.id}`}
              className="truncate text-sm font-semibold text-foreground after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {vendor.vendorName}
            </Link>
          )}
          <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
            {vendor.vendorCode.trim() || (preview ? "CODE" : "")}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <ShipmentTypeTags types={vendor.shipmentTypes} />
          {vendor.services?.length ? (
            <span className="truncate text-foreground/80">
              {vendor.services.map((service) => service.serviceName).join(" · ")}
            </span>
          ) : null}
          {!vendor.isActive ? (
            <span className="font-medium text-[var(--mli-on-error-container)] sm:hidden">Inactive</span>
          ) : null}
          <span className="hidden sm:inline">
            {preview
              ? "New vendor"
              : vendor.updatedAt
                ? `Updated ${localDate(vendor.updatedAt)}${updatedBy ? ` · ${updatedBy}` : ""}`
                : ""}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          title={vendor.npwp ? `Tax ID ${vendor.npwp}` : "No tax ID (NPWP) yet"}
          className={cn(
            "flex size-7 items-center justify-center rounded-full",
            vendor.npwp
              ? "bg-[var(--mli-success-container)] text-[var(--mli-on-success-container)]"
              : "bg-[var(--mli-warning-container)] text-[var(--mli-on-warning-container)]"
          )}
        >
          {vendor.npwp ? <IconFileCertificate className="size-3.5" /> : <IconFileAlert className="size-3.5" />}
          <span className="sr-only">{vendor.npwp ? "Has tax ID" : "No tax ID yet"}</span>
        </span>
        {!vendor.isActive ? (
          <span className="hidden rounded-full bg-[var(--mli-error-container)] px-2 py-0.5 text-[11px] font-medium text-[var(--mli-on-error-container)] sm:inline">
            Inactive
          </span>
        ) : null}
        {actions ? (
          <div className="relative z-10 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
            {actions}
          </div>
        ) : null}
      </div>
    </Root>
  )
}

/** Suppliers listed A–Z, with a letter rail to jump around. */
export function SupplierRoster({
  vendors,
  renderActions,
}: {
  vendors: Vendor[]
  renderActions: (vendor: Vendor) => ReactNode
}) {
  const groups = groupByLetter(vendors)
  const present = new Set(groups.keys())

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-6">
      <div className="min-w-0 lg:hidden">
        <LetterRail present={present} orientation="horizontal" />
      </div>
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <LetterRail present={present} orientation="vertical" />
        </div>
      </div>

      <div className="min-w-0 space-y-6">
        {[...groups.entries()].map(([letter, items]) => (
          <section key={letter} id={`roster-${letter}`} className="scroll-mt-24">
            <div className="mb-2.5 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl brand-fill text-base font-semibold text-primary-foreground">
                {letter}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {items.length} supplier{items.length === 1 ? "" : "s"}
              </span>
              <span aria-hidden className="h-px flex-1 bg-border" />
            </div>
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-2 xl:grid-cols-2">
              {items.map((vendor) => (
                <RosterRow key={vendor.id} vendor={vendor} actions={renderActions(vendor)} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

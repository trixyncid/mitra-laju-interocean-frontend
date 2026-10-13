"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { IconFileCertificate, IconFileAlert, IconMapPin } from "@tabler/icons-react"

import type { Customer } from "@/app/dashboard/customers/columns"
import { Monogram, updatedByName } from "@/components/directory/primitives"
import { ShipmentTypeTags } from "@/components/ui/shipment-type-tag"
import { cn, localDate } from "@/lib/utils"

type ClientCardData = Pick<
  Customer,
  "customerName" | "customerCode" | "npwp" | "address" | "shipmentTypes" | "isActive" | "updatedAt" | "updatedBy"
>

/**
 * One client in the directory. The whole card opens the client; `actions`
 * sit above the link so they stay clickable.
 */
export function ClientCard({
  customer,
  href,
  actions,
  preview = false,
}: {
  customer: ClientCardData
  href?: string
  actions?: ReactNode
  preview?: boolean
}) {
  const name = customer.customerName.trim()
  const updatedBy = updatedByName(customer.updatedBy)

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl surface",
        href && "transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-elev-2"
      )}
    >
      {/* A thin colour band keyed to the client, so cards are easy to tell apart. */}
      <div aria-hidden className={cn("h-1.5 w-full", name ? "opacity-90" : "opacity-40", tintBand(name))} />

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <Monogram name={name} className="size-12 text-base" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold text-foreground">
              {href ? (
                <Link
                  href={href}
                  className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                >
                  {name || "Customer name"}
                </Link>
              ) : (
                name || <span className="text-muted-foreground">Customer name</span>
              )}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                {customer.customerCode.trim() || "CODE"}
              </span>
              <ShipmentTypeTags types={customer.shipmentTypes} />
            </div>
          </div>
          {!preview ? (
            <span
              title={customer.isActive ? "Active" : "Inactive"}
              className={cn(
                "mt-1 size-2.5 shrink-0 rounded-full ring-4",
                customer.isActive
                  ? "bg-[var(--mli-positive)] ring-[var(--mli-success-container)]"
                  : "bg-[var(--mli-negative)] ring-[var(--mli-error-container)]"
              )}
            />
          ) : null}
        </div>

        <div className="space-y-1.5 text-xs">
          {customer.npwp ? (
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <IconFileCertificate className="size-3.5 shrink-0 text-[var(--mli-on-success-container)]" />
              <span className="truncate">
                Tax ID <span className="font-mono">{customer.npwp}</span>
              </span>
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-[var(--mli-on-warning-container)]">
              <IconFileAlert className="size-3.5 shrink-0" />
              No tax ID (NPWP) yet
            </p>
          )}
          <p className="flex items-start gap-1.5 text-muted-foreground">
            <IconMapPin className="mt-px size-3.5 shrink-0" />
            <span className="line-clamp-1">{customer.address?.trim() || "No address yet"}</span>
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/70 pt-3">
          <p className="min-w-0 truncate text-xs text-muted-foreground">
            {preview
              ? "New client"
              : customer.updatedAt
                ? `Updated ${localDate(customer.updatedAt)}${updatedBy ? ` · ${updatedBy}` : ""}`
                : "Not updated yet"}
          </p>
          {actions ? <div className="relative z-10 shrink-0">{actions}</div> : null}
        </div>
      </div>
    </article>
  )
}

const BANDS = [
  "bg-[var(--mli-on-export-container)]",
  "bg-[var(--mli-on-import-container)]",
  "bg-[var(--mli-on-domestic-container)]",
  "bg-[var(--mli-on-backup-container)]",
  "bg-[var(--mli-on-success-container)]",
  "bg-[var(--mli-on-draft-container)]",
] as const

/** Matches `tintFor` so the band and the monogram share a colour family. */
function tintBand(seed: string) {
  if (!seed) return "bg-muted-foreground/30"
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return BANDS[Math.abs(hash) % BANDS.length]
}

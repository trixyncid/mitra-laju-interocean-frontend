"use client"

import type { ComponentType } from "react"
import {
  IconBuilding,
  IconCalendar,
  IconClock,
  IconHash,
  IconReceipt,
  IconUserCheck,
} from "@tabler/icons-react"

import type { Vendor } from "@/app/dashboard/vendors/columns"
import { Separator } from "@/components/ui/separator"
import { StatusChip, WarningChip } from "@/components/ui/status-chip"
import { glassShine, metadataCardShell, metadataIconWell } from "@/lib/design"
import { localDate } from "@/lib/utils"

function MetadataRow({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={metadataIconWell}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs font-semibold tracking-[0.05em] text-muted-foreground uppercase">
          {label}
        </p>
        <div className="text-sm font-medium text-foreground">{children}</div>
      </div>
    </div>
  )
}

function updatedByLabel(updatedBy: Vendor["updatedBy"]) {
  if (!updatedBy) return undefined
  if (typeof updatedBy === "string") return updatedBy
  return updatedBy.name
}

export function VendorMetadataCard({ vendor }: { vendor: Vendor }) {
  const updatedByName = updatedByLabel(vendor.updatedBy)

  return (
    <div className={metadataCardShell}>
      <div aria-hidden className={glassShine} />
      <div className="relative bg-gradient-to-br from-primary via-[var(--mli-primary-container)] to-primary px-6 py-8 text-primary-foreground">
        <p className="text-xs font-semibold tracking-[0.08em] text-primary-foreground/70 uppercase">
          Vendor overview
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">{vendor.vendorName}</h2>
        <p className="mt-2 font-mono text-sm tracking-wide text-primary-foreground/80">
          {vendor.vendorCode}
        </p>
      </div>

      <div className="relative space-y-5 px-6 py-6">
        <MetadataRow icon={IconHash} label="Vendor code">
          <span className="font-mono tracking-wide">{vendor.vendorCode}</span>
        </MetadataRow>

        <MetadataRow icon={IconBuilding} label="Vendor name">
          {vendor.vendorName}
        </MetadataRow>

        <MetadataRow icon={IconReceipt} label="NPWP">
          {vendor.npwp ? (
            <span className="font-mono tracking-wide">{vendor.npwp}</span>
          ) : (
            <WarningChip>Unavailable</WarningChip>
          )}
        </MetadataRow>

        <MetadataRow icon={IconUserCheck} label="Status">
          <StatusChip active={vendor.isActive} />
        </MetadataRow>

        <Separator className="bg-[rgba(214,227,255,0.35)]" />

        {vendor.createdAt ? (
          <MetadataRow icon={IconCalendar} label="Created">
            {localDate(vendor.createdAt)}
          </MetadataRow>
        ) : null}

        <MetadataRow icon={IconClock} label="Last updated">
          {vendor.updatedAt ? localDate(vendor.updatedAt) : "—"}
          {updatedByName ? (
            <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
              by {updatedByName}
            </span>
          ) : null}
        </MetadataRow>
      </div>
    </div>
  )
}

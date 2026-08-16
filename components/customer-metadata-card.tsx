"use client"

import type { ComponentType } from "react"
import {
  IconBuilding,
  IconCalendar,
  IconClock,
  IconHash,
  IconMapPin,
  IconReceipt,
  IconUserCheck,
} from "@tabler/icons-react"

import type { Customer } from "@/app/dashboard/customers/columns"
import { Separator } from "@/components/ui/separator"
import { StatusChip, WarningChip } from "@/components/ui/status-chip"
import { ShipmentTypeTags } from "@/components/ui/shipment-type-tag"
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

function updatedByLabel(updatedBy: Customer["updatedBy"]) {
  if (!updatedBy) return undefined
  if (typeof updatedBy === "string") return updatedBy
  return updatedBy.name
}

export function CustomerMetadataCard({ customer }: { customer: Customer }) {
  const updatedByName = updatedByLabel(customer.updatedBy)

  return (
    <div className={metadataCardShell}>
      <div aria-hidden className={glassShine} />
      <div className="relative bg-gradient-to-br from-primary via-[var(--mli-primary-container)] to-primary px-6 py-8 text-primary-foreground">
        <p className="text-xs font-semibold tracking-[0.08em] text-primary-foreground/70 uppercase">
          Customer overview
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <h2 className="text-xl font-semibold tracking-tight">{customer.customerName}</h2>
          <ShipmentTypeTags types={customer.shipmentTypes} tone="onPrimary" />
        </div>
        <p className="mt-2 font-mono text-sm tracking-wide text-primary-foreground/80">
          {customer.customerCode}
        </p>
      </div>

      <div className="relative space-y-5 px-6 py-6">
        <MetadataRow icon={IconHash} label="Customer code">
          <span className="font-mono tracking-wide">{customer.customerCode}</span>
        </MetadataRow>

        <MetadataRow icon={IconBuilding} label="Customer name">
          {customer.customerName}
        </MetadataRow>

        <MetadataRow icon={IconMapPin} label="Address">
          {customer.address ? customer.address : <WarningChip>Unavailable</WarningChip>}
        </MetadataRow>

        <MetadataRow icon={IconReceipt} label="NPWP">
          {customer.npwp ? (
            <span className="font-mono tracking-wide">{customer.npwp}</span>
          ) : (
            <WarningChip>Unavailable</WarningChip>
          )}
        </MetadataRow>

        <MetadataRow icon={IconUserCheck} label="Status">
          <StatusChip active={customer.isActive} />
        </MetadataRow>

        <Separator className="bg-[rgba(214,227,255,0.35)]" />

        {customer.createdAt ? (
          <MetadataRow icon={IconCalendar} label="Created">
            {localDate(customer.createdAt)}
          </MetadataRow>
        ) : null}

        <MetadataRow icon={IconClock} label="Last updated">
          {customer.updatedAt ? localDate(customer.updatedAt) : "—"}
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

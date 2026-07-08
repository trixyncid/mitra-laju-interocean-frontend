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

import type { Customer } from "@/app/dashboard/customers/columns"
import { Separator } from "@/components/ui/separator"
import { StatusChip, WarningChip } from "@/components/ui/status-chip"
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
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground">
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
    <div className="overflow-hidden rounded-[3rem] border border-border bg-card shadow-ambient-hover">
      <div className="bg-gradient-to-br from-primary via-[var(--mli-primary-container)] to-primary px-6 py-8 text-primary-foreground">
        <p className="text-xs font-semibold tracking-[0.08em] text-primary-foreground/70 uppercase">
          Customer overview
        </p>
        <h2 className="mt-1 text-xl font-semibold">{customer.customerName}</h2>
        <p className="mt-1 truncate text-sm text-primary-foreground/80">
          {customer.customerCode}
        </p>
      </div>

      <div className="space-y-5 px-6 py-6">
        <MetadataRow icon={IconHash} label="Customer code">
          {customer.customerCode}
        </MetadataRow>

        <MetadataRow icon={IconBuilding} label="Customer name">
          {customer.customerName}
        </MetadataRow>

        <MetadataRow icon={IconReceipt} label="NPWP">
          {customer.npwp ? customer.npwp : <WarningChip>Unavailable</WarningChip>}
        </MetadataRow>

        <MetadataRow icon={IconUserCheck} label="Status">
          <StatusChip active={customer.isActive} />
        </MetadataRow>

        <Separator />

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

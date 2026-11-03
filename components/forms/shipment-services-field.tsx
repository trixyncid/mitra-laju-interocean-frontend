"use client"

import { useMemo, useState } from "react"
import { IconPlus, IconTrash } from "@tabler/icons-react"

import type { Vendor } from "@/app/dashboard/vendors/columns"
import type { ShipmentServiceLine } from "@/app/dashboard/shipments/columns"
import { QuickAddVendorDialog } from "@/components/forms/quick-add-vendor-dialog"
import {
  SearchableCombobox,
  type SearchableComboboxOption,
} from "@/components/searchable-combobox"
import { Button } from "@/components/ui/button"
import { FieldDescription } from "@/components/ui/field"
import { FormLabel } from "@/components/ui/form-label"
import { useVendorSearch } from "@/hooks/use-entity-searches"
import { usePermissions } from "@/hooks/use-permissions"
import { useActiveServices } from "@/hooks/use-services"
import { vendorLabel } from "@/lib/vendor-label"

/** One service line while it is being edited. */
export type ServiceLineDraft = {
  key: string
  serviceId: string
  vendorId: string
  /** Shown while the vendor isn't in the current search results. */
  vendorLabel: string
}

let draftKey = 0
const nextKey = () => `line-${++draftKey}`

export function emptyServiceLine(): ServiceLineDraft {
  return { key: nextKey(), serviceId: "", vendorId: "", vendorLabel: "" }
}

/** Saved service lines → editable drafts. */
export function toServiceLineDrafts(lines: ShipmentServiceLine[] | undefined): ServiceLineDraft[] {
  return (lines ?? []).map((line) => ({
    key: nextKey(),
    serviceId: line.serviceId,
    vendorId: line.vendorId ?? "",
    vendorLabel: vendorLabel(line.vendor) ?? "",
  }))
}

/** Drafts → the API payload; lines without a service are dropped. */
export function toServiceLinePayload(lines: ServiceLineDraft[]) {
  return lines
    .filter((line) => line.serviceId)
    .map((line) => ({ serviceId: line.serviceId, vendorId: line.vendorId || null }))
}

/** Service options: every active service, plus inactive ones already on this shipment. */
export function useServiceOptions(enabled: boolean, saved?: ShipmentServiceLine[]) {
  const { data, isLoading } = useActiveServices(enabled)
  const items = useMemo<SearchableComboboxOption[]>(() => {
    const active = (data?.items ?? [])
      .filter((service) => service.id)
      .map((service) => ({ value: service.id as string, label: service.serviceName }))
    const inactive = (saved ?? [])
      .filter((line) => !active.some((option) => option.value === line.serviceId))
      .map((line) => ({ value: line.serviceId, label: `${line.service.serviceName} (inactive)` }))
    return [...active, ...inactive.filter((a, i, all) => all.findIndex((b) => b.value === a.value) === i)]
  }, [data?.items, saved])
  return { items, isLoading }
}

function ServiceLineRow({
  line,
  serviceItems,
  servicesLoading,
  enabled,
  canCreateVendor,
  onChange,
  onRemove,
  onQuickAddVendor,
}: {
  line: ServiceLineDraft
  serviceItems: SearchableComboboxOption[]
  servicesLoading: boolean
  enabled: boolean
  canCreateVendor: boolean
  onChange: (line: ServiceLineDraft) => void
  onRemove: () => void
  onQuickAddVendor: () => void
}) {
  const [search, setSearch] = useState("")
  const hasService = Boolean(line.serviceId)
  const { data, isLoading, isFetching, isError } = useVendorSearch(
    search,
    enabled && hasService,
    "true",
    line.serviceId || undefined
  )

  const vendorItems = useMemo<SearchableComboboxOption[]>(() => {
    const items = (data?.items ?? [])
      .filter((vendor: Vendor) => vendor.id)
      .map((vendor: Vendor) => ({ value: vendor.id as string, label: vendorLabel(vendor) ?? "" }))
    if (line.vendorId && !items.some((item) => item.value === line.vendorId)) {
      items.unshift({ value: line.vendorId, label: line.vendorLabel || "Selected vendor" })
    }
    return items
  }, [data?.items, line.vendorId, line.vendorLabel])

  const serviceName = serviceItems.find((item) => item.value === line.serviceId)?.label

  return (
    <li className="grid gap-3 rounded-xl bg-muted/50 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:items-start">
      <SearchableCombobox
        id={`${line.key}-service`}
        label="Service"
        value={line.serviceId}
        onValueChange={(serviceId) =>
          // A different service may not suit the chosen vendor, so start the vendor over.
          onChange({ ...line, serviceId, vendorId: "", vendorLabel: "" })
        }
        items={serviceItems}
        isLoading={servicesLoading}
        placeholder="Pick a service..."
        emptyMessage="No services found."
      />
      <SearchableCombobox
        id={`${line.key}-vendor`}
        label="Vendor"
        value={line.vendorId}
        onValueChange={(vendorId) =>
          onChange({
            ...line,
            vendorId,
            vendorLabel: vendorItems.find((item) => item.value === vendorId)?.label ?? "",
          })
        }
        items={vendorItems}
        disabled={!hasService}
        isLoading={hasService && isLoading}
        isSearching={isFetching}
        searchError={isError}
        onSearchTermChange={setSearch}
        placeholder={hasService ? `Search ${serviceName?.toLowerCase() ?? ""} vendor...` : "Pick a service first"}
        emptyMessage="No vendors found."
        quickAddLabel="Add new vendor"
        onQuickAdd={canCreateVendor && hasService ? onQuickAddVendor : undefined}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        aria-label={serviceName ? `Remove ${serviceName}` : "Remove service"}
        className="text-muted-foreground hover:bg-[var(--mli-error-container)] hover:text-[var(--mli-on-error-container)] sm:mt-6"
      >
        <IconTrash className="size-4" />
      </Button>
    </li>
  )
}

/**
 * The services booked on a shipment: each line is a service (trucking,
 * freight, customs…) and the vendor it is booked to. The vendor picker lists
 * vendors tagged with the line's service, plus untagged ones.
 */
export function ShipmentServicesField({
  value,
  onChange,
  enabled,
  saved,
}: {
  value: ServiceLineDraft[]
  onChange: (lines: ServiceLineDraft[]) => void
  /** Load options only while the form is open. */
  enabled: boolean
  /** The shipment's saved lines, so inactive services keep their names. */
  saved?: ShipmentServiceLine[]
}) {
  const { can } = usePermissions()
  const canCreateVendor = can("VENDOR", "create")
  const { items: serviceItems, isLoading: servicesLoading } = useServiceOptions(enabled, saved)
  const [quickAddKey, setQuickAddKey] = useState<string | null>(null)
  const quickAddLine = value.find((line) => line.key === quickAddKey)

  const update = (key: string, next: ServiceLineDraft) =>
    onChange(value.map((line) => (line.key === key ? next : line)))

  return (
    <div className="space-y-2.5">
      <div>
        <FormLabel>Services</FormLabel>
        <FieldDescription>
          Book each service to a vendor. Add a service more than once if two vendors share it.
        </FieldDescription>
      </div>

      {value.length > 0 ? (
        <ul className="space-y-2">
          {value.map((line) => (
            <ServiceLineRow
              key={line.key}
              line={line}
              serviceItems={serviceItems}
              servicesLoading={servicesLoading}
              enabled={enabled}
              canCreateVendor={canCreateVendor}
              onChange={(next) => update(line.key, next)}
              onRemove={() => onChange(value.filter((item) => item.key !== line.key))}
              onQuickAddVendor={() => setQuickAddKey(line.key)}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          No services yet.
        </p>
      )}

      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, emptyServiceLine()])}>
        <IconPlus className="size-4" />
        Add service
      </Button>

      <QuickAddVendorDialog
        open={quickAddLine !== undefined}
        onOpenChange={(next) => {
          if (!next) setQuickAddKey(null)
        }}
        serviceIds={quickAddLine?.serviceId ? [quickAddLine.serviceId] : undefined}
        onCreated={(vendor) => {
          if (!quickAddLine || !vendor.id) return
          update(quickAddLine.key, {
            ...quickAddLine,
            vendorId: vendor.id,
            vendorLabel: vendorLabel(vendor) ?? "",
          })
        }}
      />
    </div>
  )
}

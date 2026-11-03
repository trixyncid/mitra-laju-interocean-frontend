"use client"

import Link from "next/link"

import type { ServiceRef } from "@/app/dashboard/services/columns"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { useActiveServices } from "@/hooks/use-services"
import { usePermissions } from "@/hooks/use-permissions"

/** Services a vendor provides; the shipment form suggests the vendor for these. */
export function VendorServicesField({
  id,
  value,
  current = [],
  onValueChange,
}: {
  id?: string
  /** Ticked service ids. */
  value: string[]
  /** The vendor's saved services, so an inactive one can still be unticked. */
  current?: ServiceRef[]
  onValueChange: (value: string[]) => void
}) {
  const { can } = usePermissions()
  const { data, isLoading } = useActiveServices()
  const active = data?.items ?? []
  const options = [
    ...active.map((service) => ({ id: service.id ?? "", name: service.serviceName })),
    ...current
      .filter((service) => !active.some((option) => option.id === service.id))
      .map((service) => ({ id: service.id, name: `${service.serviceName} (inactive)` })),
  ].filter((option) => option.id)

  function toggle(serviceId: string) {
    onValueChange(
      value.includes(serviceId)
        ? value.filter((item) => item !== serviceId)
        : [...value, serviceId]
    )
  }

  return (
    <Field>
      <FieldLabel htmlFor={id} className="cursor-default">
        Services
      </FieldLabel>
      <FieldContent>
        {isLoading ? (
          <div className="flex gap-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
        ) : options.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No services yet.{" "}
            {can("SERVICE", "create") ? (
              <Link href="/dashboard/services" className="font-medium text-primary hover:underline">
                Add services
              </Link>
            ) : null}
          </p>
        ) : (
          <div id={id} className="flex flex-wrap gap-x-4 gap-y-2">
            {options.map((option) => (
              <label key={option.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={value.includes(option.id)}
                  onCheckedChange={() => toggle(option.id)}
                />
                <span>{option.name}</span>
              </label>
            ))}
          </div>
        )}
        <FieldDescription>
          Tick what this vendor provides. On a shipment, picking a service lists these vendors (and untagged ones).
        </FieldDescription>
      </FieldContent>
    </Field>
  )
}

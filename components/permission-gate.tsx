"use client"

import type { ReactNode } from "react"

import { usePermissions, type AppResource } from "@/hooks/use-permissions"
import type { PermissionAction, ShipmentType } from "@/lib/permissions"

type PermissionGateProps = {
  resource: AppResource
  /** When set, checks a specific CRUD action. Defaults to view, or write-any when `write` is true. */
  action?: PermissionAction
  write?: boolean
  shipmentType?: ShipmentType | string
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({
  resource,
  action,
  write = false,
  shipmentType,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { canRead, canWrite, canWriteShipmentType, can } = usePermissions()

  let allowed = false
  if (write || action === "create" || action === "edit" || action === "delete") {
    if (shipmentType !== undefined) {
      allowed = canWriteShipmentType(shipmentType)
    } else if (action) {
      const moduleMap: Record<string, Parameters<typeof can>[0] | null> = {
        dashboard: "DASHBOARD",
        masterData: null,
        shipments: "SHIPMENT",
        costings: "COSTING",
        sellings: "SELLING",
        users: "USER",
        roles: "ROLE",
      }
      const module = moduleMap[resource]
      if (module) {
        allowed = can(module, action)
      } else if (resource === "masterData") {
        allowed =
          can("CUSTOMER", action) ||
          can("VENDOR", action) ||
          can("PORT", action) ||
          can("VESSEL", action)
      }
    } else {
      allowed = canWrite(resource)
    }
  } else {
    allowed = canRead(resource)
  }

  return allowed ? <>{children}</> : <>{fallback}</>
}

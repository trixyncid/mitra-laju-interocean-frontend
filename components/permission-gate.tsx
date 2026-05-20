"use client"

import type { ReactNode } from "react"

import { usePermissions, type AppResource } from "@/hooks/use-permissions"
import type { ShipmentType } from "@/lib/permissions"

type PermissionGateProps = {
  resource: AppResource
  write?: boolean
  shipmentType?: ShipmentType | string
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({
  resource,
  write = false,
  shipmentType,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { canRead, canWrite, canWriteShipmentType } = usePermissions()

  const allowed = write
    ? shipmentType !== undefined
      ? canWriteShipmentType(shipmentType)
      : canWrite(resource)
    : canRead(resource)

  return allowed ? <>{children}</> : <>{fallback}</>
}

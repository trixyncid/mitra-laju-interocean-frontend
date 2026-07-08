"use client"

import type { ReactNode } from "react"

import { PermissionGate } from "@/components/permission-gate"
import type { ShipmentType } from "@/lib/permissions"

export function MasterDataWriteGate({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return (
    <PermissionGate resource="masterData" write fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function ShipmentWriteGate({
  children,
  shipmentType,
}: {
  children: ReactNode
  shipmentType?: ShipmentType | string
}) {
  return (
    <PermissionGate resource="shipments" write shipmentType={shipmentType}>
      {children}
    </PermissionGate>
  )
}

export function CostingWriteGate({ children }: { children: ReactNode }) {
  return (
    <PermissionGate resource="costings" write>
      {children}
    </PermissionGate>
  )
}

export function SellingWriteGate({ children }: { children: ReactNode }) {
  return (
    <PermissionGate resource="sellings" write>
      {children}
    </PermissionGate>
  )
}

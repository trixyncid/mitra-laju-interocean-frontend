"use client"

import { authClient } from "@/lib/auth-client"
import { getUserRole } from "@/hooks/use-require-admin"
import {
  allowedShipmentTypes,
  canAccessRoute,
  canRead,
  canReadContainers,
  canReadShipmentsForCosting,
  canReadVendorsForCosting,
  canWrite,
  canWriteShipmentType,
  getEffectiveRole,
  type AppResource,
  type ShipmentType,
  type UserRole,
} from "@/lib/permissions"

export function usePermissions() {
  const { data: session, isPending, error } = authClient.useSession()
  const rawRole = getUserRole(session?.user)
  const role = getEffectiveRole(rawRole)

  return {
    session,
    isPending,
    error,
    role,
    rawRole,
    canRead: (resource: AppResource) => canRead(role, resource),
    canWrite: (resource: AppResource) => canWrite(role, resource),
    canWriteShipmentType: (shipmentType: ShipmentType | string | undefined) =>
      canWriteShipmentType(role, shipmentType),
    canAccessRoute: (pathname: string) => canAccessRoute(rawRole, pathname),
    allowedShipmentTypes: allowedShipmentTypes(role),
    canReadVendorsForCosting: () => canReadVendorsForCosting(role),
    canReadShipmentsForCosting: () => canReadShipmentsForCosting(role),
    canReadContainers: () => canReadContainers(role),
  }
}

export type { AppResource, ShipmentType, UserRole }

"use client"

import { useMyPermissions } from "@/hooks/use-my-permissions"
import {
  allowedShipmentTypesFromRole,
  canAccessRouteWithPermissions,
  canReadContainersWithPermissions,
  canReadResource,
  canReadShipmentsForCostingWithPermissions,
  canReadVendorsForCostingWithPermissions,
  canWriteResource,
  canWriteShipmentTypeWithPermissions,
  can as canAction,
  type AppModule,
  type AppResource,
  type PermissionAction,
  type ShipmentType,
  type UserRole,
} from "@/lib/permissions"

export function usePermissions() {
  const { session, roleSlug, permissions, isPending, error } = useMyPermissions()
  const role = roleSlug ?? "viewer"
  const perms = permissions?.permissions
  const roleDetails = permissions?.role ?? null

  return {
    session,
    isPending,
    error,
    role,
    rawRole: roleSlug,
    roleDetails,
    permissions: perms,
    can: (module: AppModule, action: PermissionAction) =>
      canAction(perms, module, action, role),
    canRead: (resource: AppResource) => canReadResource(perms, resource, role),
    canWrite: (resource: AppResource) => canWriteResource(perms, resource, role),
    canWriteShipmentType: (shipmentType: ShipmentType | string | undefined) =>
      canWriteShipmentTypeWithPermissions(perms, roleDetails, shipmentType, role),
    canAccessRoute: (pathname: string) =>
      canAccessRouteWithPermissions(perms, pathname, role),
    allowedShipmentTypes: allowedShipmentTypesFromRole(roleDetails, role),
    canReadVendorsForCosting: () =>
      canReadVendorsForCostingWithPermissions(perms, role),
    canReadShipmentsForCosting: () =>
      canReadShipmentsForCostingWithPermissions(perms, role),
    canReadContainers: () => canReadContainersWithPermissions(perms, role),
  }
}

export type { AppResource, AppModule, PermissionAction, ShipmentType, UserRole }

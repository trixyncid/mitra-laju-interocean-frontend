"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"

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
  /** Where to send users who fail a write check. Defaults to the parent list route. */
  writeRedirectTo?: string
}

function defaultWriteRedirect(pathname: string) {
  if (pathname.endsWith("/new")) {
    return pathname.replace(/\/new$/, "")
  }
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length > 2) {
    return `/${segments.slice(0, -1).join("/")}`
  }
  return "/dashboard"
}

function WritePermissionDenied({
  redirectTo,
}: {
  redirectTo: string
}) {
  const router = useRouter()
  const notified = useRef(false)

  useEffect(() => {
    if (notified.current) return
    notified.current = true
    toast.error("You do not have permission to edit this page.")
    router.replace(redirectTo)
  }, [redirectTo, router])

  return null
}

export function PermissionGate({
  resource,
  action,
  write = false,
  shipmentType,
  children,
  fallback,
  writeRedirectTo,
}: PermissionGateProps) {
  const pathname = usePathname()
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
          can("VESSEL", action) ||
          can("CONTAINER", action)
      }
    } else {
      allowed = canWrite(resource)
    }
  } else {
    allowed = canRead(resource)
  }

  if (allowed) return <>{children}</>

  if (fallback !== undefined) return <>{fallback}</>

  if (write || action === "create" || action === "edit" || action === "delete") {
    return (
      <WritePermissionDenied
        redirectTo={writeRedirectTo ?? defaultWriteRedirect(pathname)}
      />
    )
  }

  return null
}

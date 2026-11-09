"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconPlus, IconReceipt } from "@tabler/icons-react"

import { SalesFormDialog } from "@/components/sales/sales-form-dialog"
import { Button } from "@/components/ui/button"
import { usePermissions } from "@/hooks/use-permissions"
import type { ShipmentType } from "@/lib/permissions"
import type { ShipmentDetail } from "@/lib/types/entity-details"
import type { SalesShipment } from "@/lib/types/sales"

function toSalesShipment(shipment: ShipmentDetail): SalesShipment {
  const op = shipment.shipmentOperational
  return {
    id: shipment.id,
    status: shipment.status,
    customerCodeId: shipment.customerCodeId,
    customerCode: shipment.customerCode,
    shipmentOperational: op
      ? {
          shipmentType: (op.shipmentType as ShipmentType) ?? null,
          bookingNumber: op.bookingNumber,
          blNumber: op.blNumber,
          eta: op.eta,
          portDeparture: op.portDeparture,
          portDestination: op.portDestination,
          vessel: op.vessel,
        }
      : null,
  }
}

/**
 * The shipment's sales job: a link when it has one, otherwise a button that
 * opens the sales job form with this shipment and its customer filled in.
 */
export function ShipmentSalesAction({
  shipment,
  size = "default",
}: {
  shipment: ShipmentDetail
  size?: "default" | "sm"
}) {
  const router = useRouter()
  const { can } = usePermissions()

  if (shipment.sales) {
    if (!can("SALES", "view")) return null
    return (
      <Button asChild variant="outline" size={size}>
        <Link href={`/dashboard/sales/${shipment.sales.id}`}>
          <IconReceipt className="size-4" />
          {shipment.sales.salesNumber}
        </Link>
      </Button>
    )
  }

  if (!can("SALES", "create")) return null

  return (
    <SalesFormDialog
      mode="create"
      defaultShipment={toSalesShipment(shipment)}
      onSaved={(sales) => router.push(`/dashboard/sales/${sales.id}`)}
      trigger={
        <Button variant="outline" size={size}>
          <IconPlus className="size-4" />
          Create sales order
        </Button>
      }
    />
  )
}

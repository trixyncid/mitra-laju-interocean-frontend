"use client"

import { Row } from "@tanstack/react-table"

import type { Costing } from "@/app/dashboard/costings/columns"
import CostingForm from "@/components/forms/costing-form"
import LinkCostingForm from "@/components/forms/link-costing-form"
import { usePermissions } from "@/hooks/use-permissions"

export default function CostingActionCell({ row }: { row: Row<Costing> }) {
  const { canWrite } = usePermissions()

  if (!canWrite("costings")) return null

  return (
    <div className="flex items-center gap-x-2">
      <CostingForm
        mode="edit"
        id={row.original.id}
        costingNumber={row.original.costingNumber}
        description={row.original.description}
        price={row.original.price}
        currency={row.original.currency}
        currencyCode={row.original.currencyCode ?? "IDR"}
        containerNumber={row.original.containerNumber ?? undefined}
        vatPercentage={row.original.vatPercentage}
        pph23Percentage={row.original.pph23Percentage}
        vendorInvoiceNumber={row.original.vendorInvoiceNumber}
        vendorId={row.original.vendorId}
        shipmentId={row.original.shipment?.id ?? null}
      />
      <LinkCostingForm
        id={row.original.id}
        shipmentId={row.original.shipment?.id ?? undefined}
      />
    </div>
  )
}

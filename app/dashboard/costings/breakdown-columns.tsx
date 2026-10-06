"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Info } from "lucide-react"
import Link from "next/link"
import { IconLink } from "@tabler/icons-react"

import type { CostingBreakdownListItem } from "@/services/costing.service"
import { AssignBreakdownsToShipmentForm } from "@/components/forms/assign-breakdowns-shipment-form"
import { PaymentStatusChip, WarningChip } from "@/components/ui/status-chip"
import { Button } from "@/components/ui/button"
import { primaryText, secondaryText } from "@/lib/design"
import {
  actionColumn,
  numberSort,
  sortHeader,
  textSort,
} from "@/lib/data-table"
import { costingLineGross, localDate } from "@/lib/utils"

function formatIdr(value: number) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

function BreakdownAssignAction({ row }: { row: CostingBreakdownListItem }) {
  return (
    <AssignBreakdownsToShipmentForm
      costingId={row.costingId}
      breakdownIds={[row.id]}
      initialShipmentId={row.shipmentId}
      initialShipmentLabel={row.shipment?.orderNumber ?? null}
      title="Link to shipment"
      description={`Assign “${row.productDescription}” to a shipment.`}
      trigger={
        <Button variant="ghost" size="icon-sm" type="button">
          <IconLink className="size-4" />
          <span className="sr-only">Link to shipment</span>
        </Button>
      }
    />
  )
}

export const breakdownColumns: ColumnDef<CostingBreakdownListItem>[] = [
  {
    id: "productDescription",
    accessorFn: (row) => row.productDescription,
    header: ({ column }) => sortHeader(column, "Description"),
    ...textSort,
    cell: ({ row }) => (
      <div className="min-w-0 max-w-[240px]">
        <Link
          href={`/dashboard/costings/${row.original.costingId}`}
          className={`${primaryText} flex items-center gap-x-1 hover:underline`}
        >
          <span className="truncate">{row.original.productDescription}</span>
          <Info className="size-3.5 shrink-0 text-muted-foreground" />
        </Link>
        {row.original.containerNumber ? (
          <p className="truncate text-xs text-muted-foreground">
            Ctr. {row.original.containerNumber}
            {row.original.containerSize?.name
              ? ` · ${row.original.containerSize.name}`
              : ""}
            {row.original.containerType?.name
              ? ` ${row.original.containerType.name}`
              : ""}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    id: "vendor",
    accessorFn: (row) => row.costing.vendor?.vendorName ?? "",
    header: ({ column }) => sortHeader(column, "Vendor"),
    ...textSort,
    cell: ({ row }) => (
      <span className={secondaryText}>
        {row.original.costing.vendor?.vendorName ?? "—"}
      </span>
    ),
  },
  {
    id: "vendorInvoiceNumber",
    accessorFn: (row) => row.costing.vendorInvoiceNumber ?? "",
    header: ({ column }) => sortHeader(column, "Vendor invoice"),
    ...textSort,
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className={secondaryText}>
          {row.original.costing.vendorInvoiceNumber || "—"}
        </p>
        {row.original.costing.vendorInvoiceDate ? (
          <p className="text-xs text-muted-foreground">
            {localDate(row.original.costing.vendorInvoiceDate)}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    id: "vendorVessel",
    accessorFn: (row) => row.costing.vendorVessel ?? "",
    header: ({ column }) => sortHeader(column, "Vessel"),
    ...textSort,
    cell: ({ row }) => (
      <span className={secondaryText}>
        {row.original.costing.vendorVessel || "—"}
      </span>
    ),
  },
  {
    id: "shipment",
    accessorFn: (row) => row.shipment?.orderNumber ?? "",
    header: ({ column }) => sortHeader(column, "Shipment"),
    ...textSort,
    cell: ({ row }) => {
      const shipment = row.original.shipment
      if (!shipment) {
        return <WarningChip>Unassigned</WarningChip>
      }
      return (
        <Link
          href={`/dashboard/shipments/${shipment.id}`}
          className={`${secondaryText} hover:underline`}
        >
          {shipment.orderNumber}
        </Link>
      )
    },
  },
  {
    id: "costingNumber",
    accessorFn: (row) => row.costing.costingNumber,
    header: ({ column }) => sortHeader(column, "Costing #"),
    ...textSort,
    cell: ({ row }) => (
      <Link
        href={`/dashboard/costings/${row.original.costingId}`}
        className={`${secondaryText} hover:underline`}
      >
        {row.original.costing.costingNumber}
      </Link>
    ),
  },
  {
    id: "amount",
    accessorFn: (row) => costingLineGross(row),
    header: ({ column }) => sortHeader(column, "Line total"),
    ...numberSort,
    cell: ({ row }) => (
      <span className={secondaryText}>
        {formatIdr(costingLineGross(row.original))}
      </span>
    ),
  },
  {
    id: "status",
    accessorFn: (row) => row.costing.status,
    header: ({ column }) => sortHeader(column, "Payment"),
    ...textSort,
    cell: ({ row }) => (
      <PaymentStatusChip paid={row.original.costing.status === "PAID"} />
    ),
  },
  {
    ...actionColumn,
    header: "Action",
    cell: ({ row }) => <BreakdownAssignAction row={row.original} />,
  },
]

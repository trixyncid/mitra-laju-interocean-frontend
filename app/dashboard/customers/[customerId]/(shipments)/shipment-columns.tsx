"use client"

import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { IconArrowRight } from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { Info } from "lucide-react"
import { ShipmentLifecycleChip } from "@/components/ui/status-chip"
import {
  dateSort,
  numberSort,
  sortHeader,
  textSort,
} from "@/lib/data-table"

export type LinkedShipment = {
  id: string
  eta: string
  orderNumber: string
  customerCode: string
  customerShipper: string
  departureCountry: string
  arrivalCountry: string
  status: "ONGOING" | "COMPLETED"
  costingTotal: number
  sellingTotal: number
}

export const columns: ColumnDef<LinkedShipment>[] = [
  {
    accessorKey: "orderNumber",
    header: ({ column }) => sortHeader(column, "Shipment Order Number"),
    ...textSort,
    cell: ({ row }) => {
      return <div className="font-bold flex items-center gap-x-1">
        <Link href={`/dashboard/shipments/${row.original.id}`} className="hover:underline">{ row.original.orderNumber }</Link><Info className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
    }
  },
  {
    accessorKey: "customerCode",
    header: ({ column }) => sortHeader(column, "Customer"),
    ...textSort,
  },
  {
    accessorKey: "customerShipper",
    header: ({ column }) => sortHeader(column, "Shipper"),
    ...textSort,
  },
  {
    accessorKey: "costingTotal",
    header: ({ column }) => sortHeader(column, "Costing"),
    ...numberSort,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.costingTotal.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        })}
      </span>
    ),
  },
  {
    accessorKey: "sellingTotal",
    header: ({ column }) => sortHeader(column, "Selling"),
    ...numberSort,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.sellingTotal.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        })}
      </span>
    ),
  },
  {
    id: "route",
    accessorFn: (row) => `${row.departureCountry} ${row.arrivalCountry}`,
    header: ({ column }) => sortHeader(column, "Route"),
    ...textSort,
    cell: ({ row }) => {
      return (
        row.original.departureCountry !== "" && row.original.arrivalCountry !== "" ? (
          <div className="flex flex-row items-center gap-x-2">
            <p className="text-sm text-muted-foreground">{ row.original.departureCountry }</p>
            <IconArrowRight className="w-4 h-4" />
            <p className="text-sm text-muted-foreground">{ row.original.arrivalCountry }</p>
          </div>
        ) : (
          <p className="text-sm text-[var(--mli-on-warning-container)] bg-[var(--mli-warning-container)] px-2 rounded-md w-fit">Unavailable</p>
        )
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => sortHeader(column, "Status"),
    ...textSort,
    cell: ({ row }) => (
      <ShipmentLifecycleChip status={row.original.status} />
    )
  },
  {
    accessorKey: "eta",
    header: ({ column }) => sortHeader(column, "ETA"),
    ...dateSort,
    cell: ({ row }) => {
      return (
        row.original.eta !== "" ? (
          <div className="flex flex-row items-center gap-x-2">
            <p className="text-sm text-muted-foreground">{ formatDate(row.original.eta) }</p>
          </div>
        ) : (
          <p className="text-sm text-[var(--mli-on-warning-container)] bg-[var(--mli-warning-container)] px-2 rounded-md w-fit">Unavailable</p>
        )
      )
    }
  },
]

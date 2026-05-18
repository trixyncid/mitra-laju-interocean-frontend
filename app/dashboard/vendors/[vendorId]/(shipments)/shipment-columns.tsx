"use client"

import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { IconArrowRight } from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { Info } from "lucide-react"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type LinkedShipment = {
  id: string
  eta: string
  orderNumber: string
  customerCode: string
  customerShipper: string
  departureCountry: string
  arrivalCountry: string
}

export const columns: ColumnDef<LinkedShipment>[] = [
  {
    accessorKey: "orderNumber",
    header: "Shipment Order Number",
    cell: ({ row }) => {
      return <div className="font-bold flex items-center gap-x-1">
        <Link href={`/dashboard/shipments/${row.original.id}`} className="hover:underline">{ row.original.orderNumber }</Link><Info className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
    }
  },
  {
    accessorKey: "customerCode",
    header: "Customer",
  },
  {
    accessorKey: "customerShipper",
    header: "Shipper",
  },
  {
    header: "Route",
    cell: ({ row }) => {
      return (
        row.original.departureCountry !== "" && row.original.arrivalCountry !== "" ? (
          <div className="flex flex-row items-center gap-x-2">
            <p className="text-sm text-muted-foreground">{ row.original.departureCountry }</p>
            <IconArrowRight className="w-4 h-4" />
            <p className="text-sm text-muted-foreground">{ row.original.arrivalCountry }</p>
          </div>
        ) : (
          <p className="text-sm text-[var(--mli-on-warning-container)] bg-[var(--mli-warning-container)] px-2 rounded-full w-fit">Unavailable</p>
        )
      )
    },
  },
  {
    header: "ETA",
    cell: ({ row }) => {
      return (
        row.original.eta !== "" ? (
          <div className="flex flex-row items-center gap-x-2">
            <p className="text-sm text-muted-foreground">{ formatDate(row.original.eta) }</p>
          </div>
        ) : (
          <p className="text-sm text-[var(--mli-on-warning-container)] bg-[var(--mli-warning-container)] px-2 rounded-full w-fit">Unavailable</p>
        )
      )
    }
  },
]
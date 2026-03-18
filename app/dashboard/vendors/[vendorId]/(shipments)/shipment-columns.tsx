"use client"

import { IconArrowRight } from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type LinkedShipment = {
  id: string
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
      return <div className="flex flex-row items-center gap-x-2">
        <p className="text-sm text-slate-500">Departure Country</p>
        <IconArrowRight className="w-4 h-4" />
        <p className="text-sm text-slate-500">Arrival Country</p>
      </div>
    },
  },
  {
    header: "ETA",
    cell: ({ row }) => {
      return <div className="flex flex-row items-center gap-x-2">
        <p className="text-sm text-slate-500">ETA</p>
      </div>
    }
  },
]
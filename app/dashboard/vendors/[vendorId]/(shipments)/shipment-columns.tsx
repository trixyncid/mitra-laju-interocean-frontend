"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type LinkedShipment = {
  id: string
  orderNumber: string
  customerCode: string
  customerShipper: string
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
]
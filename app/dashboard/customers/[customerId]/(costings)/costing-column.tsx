"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Costing = {
  id: string
  invoiceNumber: string
  amount: number
  shipmentOrderNumber: string
}

export const columns: ColumnDef<Costing>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice Number",
  },
  {
    accessorKey: "shipmentOrderNumber",
    header: "Shipment Order Number",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
  }
]
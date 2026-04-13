"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Info } from "lucide-react"
import Link from "next/link"

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
    cell: ({ row }) => {
      return <div className="font-bold flex items-center gap-x-1">
        <Link href={`/dashboard/costings/${row.original.id}`} className="hover:underline">{ row.original.invoiceNumber }</Link><Info className="w-3.5 h-3.5 text-slate-400" />
      </div>
    }
  },
  {
    accessorKey: "shipmentOrderNumber",
    header: "Shipment Order Number",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return <div className="flex items-center">
        <p>{ row.original.amount.toLocaleString("id-ID", { style: "currency", currency: "IDR" }) }</p>
      </div>
    }
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
  }
]
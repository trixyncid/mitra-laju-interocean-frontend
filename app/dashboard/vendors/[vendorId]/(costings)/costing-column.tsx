"use client"

import { localDate } from "@/lib/utils"
import { IconLinkOff } from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import clsx from "clsx"
import { Info } from "lucide-react"
import Link from "next/link"
import {
  dateSort,
  numberSort,
  sortHeader,
  textSort,
} from "@/lib/data-table"

export type Costing = {
  id: string
  invoiceNumber: string
  amount: number
  shipmentOrderNumber: string
  updatedAt: string
}

export const columns: ColumnDef<Costing>[] = [
  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => sortHeader(column, "Invoice Number"),
    ...textSort,
    cell: ({ row }) => {
      return <div className="font-bold flex items-center gap-x-1">
        <Link href={`/dashboard/costings/${row.original.id}`} className="hover:underline">{ row.original.invoiceNumber }</Link><Info className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
    }
  },
  {
    accessorKey: "shipmentOrderNumber",
    header: ({ column }) => sortHeader(column, "Shipment Order Number"),
    ...textSort,
    cell: ({ row }) => {
      return <div className={clsx("px-3 py-1 rounded-full w-fit text-xs", row.original.shipmentOrderNumber === "" ? "bg-[var(--mli-error-container)] text-[var(--mli-on-error-container)]" : "")}>{ row.original.shipmentOrderNumber === "" ? <div className="flex items-center gap-x-2"><IconLinkOff className="h-3 w-3 animate-pulse" /> Unlinked</div> : row.original.shipmentOrderNumber }</div>
    }
  },
  {
    accessorKey: "amount",
    header: ({ column }) => sortHeader(column, "Amount"),
    ...numberSort,
    cell: ({ row }) => {
      return <div className="flex items-center">
        <p>{ row.original.amount.toLocaleString("id-ID", { style: "currency", currency: "IDR" }) }</p>
      </div>
    }
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => sortHeader(column, "Updated At"),
    ...dateSort,
    cell: ({ row }) => {
      return <div className="flex items-center">
        <p>{ localDate(row.original.updatedAt.split("T")[0]) }</p>
      </div>
    }
  }
]

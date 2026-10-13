"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Info } from "lucide-react"
import Link from "next/link"
import { localDate } from "@/lib/utils"
import { SellingStatusChip } from "@/components/ui/status-chip"
import { secondaryText } from "@/lib/design"
import {
  dateSort,
  sortHeader,
  textSort,
} from "@/lib/data-table"

export type CustomerSelling = {
  id: string
  sellingNumber: string
  description: string
  shipmentReference: string
  status: string
  updatedAt: string
}

export const columns: ColumnDef<CustomerSelling>[] = [
  {
    accessorKey: "sellingNumber",
    header: ({ column }) => sortHeader(column, "Selling #"),
    ...textSort,
    cell: ({ row }) => (
      <div className="flex items-center gap-x-1 font-bold">
        <Link
          href={`/dashboard/sellings/${row.original.id}`}
          className="hover:underline"
        >
          {row.original.sellingNumber}
        </Link>
        <Info className="size-3.5 text-muted-foreground" />
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => sortHeader(column, "Description"),
    ...textSort,
  },
  {
    accessorKey: "shipmentReference",
    header: ({ column }) => sortHeader(column, "Shipment"),
    ...textSort,
    cell: ({ row }) => (
      <span className={secondaryText}>{row.original.shipmentReference || "—"}</span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => sortHeader(column, "Status"),
    ...textSort,
    cell: ({ row }) => (
      <SellingStatusChip status={row.original.status} />
    ),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => sortHeader(column, "Updated At"),
    ...dateSort,
    cell: ({ row }) => (
      <p>{localDate(row.original.updatedAt.split("T")[0])}</p>
    ),
  },
]

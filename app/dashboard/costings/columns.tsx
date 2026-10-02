"use client"

import CostingActionCell from "@/components/action-cell/costing-action-cell"
import {
  CostingContainerMixBadges,
  formatCostingContainerMix,
} from "@/components/ui/container-summary-tags"
import { costingInvoiceTotals, localDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { Info } from "lucide-react"
import Link from "next/link"
import { PaymentStatusChip, VendorInvoiceTypeChip } from "@/components/ui/status-chip"
import { chipActive, chipWarning, primaryText, secondaryText } from "@/lib/design"
import {
  actionColumn,
  dateSort,
  numberSort,
  sortHeader,
  textSort,
} from "@/lib/data-table"

export type CostingBreakdownSummary = {
  id: string
  productDescription: string
  quantity: number
  price: number | string
  currencyPrice: number | string
  shipmentId?: string | null
  containerNumber?: string | null
  containerSize?: { id?: string; name: string } | null
  containerType?: { id?: string; name: string } | null
  /** Invoice tax on the vendor costing line */
  vatPercentage?: number | string | null
  pph23Percentage?: number | string | null
  /** Customer-side — present after shipment link */
  sellingAmount?: number | string | null
  sellingVatPercentage?: number | string | null
  sellingPph23Percentage?: number | string | null
}

export type CostingBreakdown = CostingBreakdownSummary & {
  containerSizeId?: string | null
  containerTypeId?: string | null
  shipment?: {
    id: string
    orderNumber: string
    status: string
    isActive: boolean
  } | null
  assignedBy?: { id: string; name: string } | null
  assignedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type CostingAttachment = {
  id: string
  attachmentName: string
  fileName: string
  filePath: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: { name: string }
}

export type Costing = {
  id: string
  costingNumber: string
  createdAt: string
  vendorInvoiceNumber?: string | null
  vendorInvoiceDate?: string | null
  vendorInvoiceType?: "INVOICE" | "REIMBURSEMENT" | null
  vendorVessel?: string | null
  paymentDate?: string | null
  vendor?: { id?: string; vendorName: string; vendorCode?: string } | null
  vendorId: string
  status: string
  costingBreakdowns?: CostingBreakdownSummary[]
  _count?: { costingBreakdowns?: number }
  updatedBy?: { name?: string } | string | null
  updatedAt?: string
}

export type CostingDetail = Omit<Costing, "costingBreakdowns"> & {
  costingBreakdowns?: CostingBreakdown[]
  costingsAttachments?: CostingAttachment[]
  updatedBy?: { name: string } | null
  createdBy?: { name: string } | null
}

function formatIdr(value: number) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

export const columns: ColumnDef<Costing>[] = [
  {
    accessorKey: "costingNumber",
    header: ({ column }) => sortHeader(column, "Costing #"),
    ...textSort,
    cell: ({ row }) => (
      <div className={`${primaryText} flex min-w-0 flex-wrap items-center gap-1.5`}>
        <Link
          href={`/dashboard/costings/${row.original.id}`}
          className="flex min-w-0 items-center gap-x-1 hover:underline"
        >
          <span className="truncate">{row.original.costingNumber}</span>
          <Info className="size-3.5 shrink-0 text-muted-foreground" />
        </Link>
        <VendorInvoiceTypeChip type={row.original.vendorInvoiceType} />
      </div>
    ),
  },
  {
    id: "vendor",
    accessorFn: (row) => row.vendor?.vendorName ?? "",
    header: ({ column }) => sortHeader(column, "Vendor"),
    ...textSort,
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className={secondaryText}>{row.original.vendor?.vendorName ?? "—"}</p>
        {row.original.vendorInvoiceNumber ? (
          <p className="text-xs text-muted-foreground">
            Inv. {row.original.vendorInvoiceNumber}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "vendorInvoiceDate",
    header: ({ column }) => sortHeader(column, "Invoice date"),
    ...dateSort,
    cell: ({ row }) => (
      <span className={secondaryText}>
        {row.original.vendorInvoiceDate
          ? localDate(row.original.vendorInvoiceDate)
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "vendorVessel",
    header: ({ column }) => sortHeader(column, "Vessel"),
    ...textSort,
    cell: ({ row }) => (
      <span className={secondaryText}>{row.original.vendorVessel || "—"}</span>
    ),
  },
  {
    id: "containers",
    accessorFn: (row) => formatCostingContainerMix(row.costingBreakdowns),
    header: ({ column }) => sortHeader(column, "Container"),
    ...textSort,
    cell: ({ row }) => (
      <CostingContainerMixBadges lines={row.original.costingBreakdowns} />
    ),
  },
  {
    id: "lines",
    accessorFn: (row) => {
      const lines = row.costingBreakdowns ?? []
      return lines.filter((line) => line.shipmentId).length
    },
    header: ({ column }) => sortHeader(column, "Assignment"),
    ...numberSort,
    cell: ({ row }) => {
      const lines = row.original.costingBreakdowns ?? []
      const total =
        row.original._count?.costingBreakdowns ?? lines.length
      const assigned = lines.filter((line) => line.shipmentId).length
      const unassigned = Math.max(0, total - assigned)
      return (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={chipActive()}>{assigned} assigned</span>
          <span className={chipWarning()}>{unassigned} unassigned</span>
        </div>
      )
    },
  },
  {
    id: "amount",
    accessorFn: (row) =>
      costingInvoiceTotals(row.costingBreakdowns ?? []).net,
    header: ({ column }) => sortHeader(column, "Vendor payable"),
    ...numberSort,
    cell: ({ row }) => {
      const { net } = costingInvoiceTotals(
        row.original.costingBreakdowns ?? []
      )
      return <span className={secondaryText}>{formatIdr(net)}</span>
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => sortHeader(column, "Status"),
    ...textSort,
    cell: ({ row }) => (
      <PaymentStatusChip paid={row.original.status === "PAID"} />
    ),
  },
  {
    accessorKey: "paymentDate",
    header: ({ column }) => sortHeader(column, "Payment date"),
    ...dateSort,
    cell: ({ row }) => (
      <span className={secondaryText}>
        {row.original.paymentDate
          ? localDate(row.original.paymentDate)
          : "—"}
      </span>
    ),
  },
  {
    id: "updatedBy",
    accessorFn: (row) =>
      typeof row.updatedBy === "string"
        ? row.updatedBy
        : (row.updatedBy?.name ?? ""),
    header: ({ column }) => sortHeader(column, "Modified by"),
    ...textSort,
    cell: ({ row }) => (
      <span className={secondaryText}>
        {typeof row.original.updatedBy === "string"
          ? row.original.updatedBy
          : (row.original.updatedBy?.name ?? "—")}
      </span>
    ),
  },
  {
    ...actionColumn,
    header: "Action",
    cell: ({ row }) => <CostingActionCell row={row} />,
  },
]

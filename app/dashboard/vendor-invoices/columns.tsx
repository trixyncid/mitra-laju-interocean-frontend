"use client"

import VendorInvoiceActionCell from "@/components/action-cell/vendor-invoice-action-cell"
import {
  VendorInvoiceContainerMixBadges,
  formatVendorInvoiceContainerMix,
} from "@/components/ui/container-summary-tags"
import { vendorInvoiceInvoiceTotals, localDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { Info } from "lucide-react"
import Link from "next/link"
import { PaymentStatusChip, VendorInvoiceTypeChip } from "@/components/ui/status-chip"
import { primaryText, secondaryText } from "@/lib/design"
import { ColumnFilterHeader } from "@/components/column-filter/column-filter"
import {
  actionColumn,
  numberSort,
  sortHeader,
  textSort,
} from "@/lib/data-table"

export type VendorInvoiceBreakdownSummary = {
  id: string
  productDescription: string
  quantity: number
  price: number | string
  currencyPrice: number | string
  containerNumber?: string | null
  containerSize?: { id?: string; name: string } | null
  containerType?: { id?: string; name: string } | null
  /** Invoice tax on the vendor invoice line */
  vatPercentage?: number | string | null
  pph23Percentage?: number | string | null
}

export type VendorInvoiceBreakdown = VendorInvoiceBreakdownSummary & {
  containerSizeId?: string | null
  containerTypeId?: string | null
  costing?: { id: string; costingDescription: string | null } | null
  assignedBy?: { id: string; name: string } | null
  assignedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type VendorInvoiceAttachment = {
  id: string
  attachmentName: string
  fileName: string
  contentType: string
  size: number
  createdAt: string
  updatedAt: string
  updatedBy?: { name: string } | null
}

export type VendorInvoice = {
  id: string
  vendorInvoiceNumber: string
  createdAt: string
  vendorInvoiceDate?: string | null
  vendorInvoiceType?: "INVOICE" | "REIMBURSEMENT" | null
  vendorVessel?: string | null
  paymentDate?: string | null
  taxInvoice?: string | null
  vendor?: { id?: string; vendorName: string; vendorCode?: string } | null
  vendorId: string
  status: string
  vendorInvoiceBreakdowns?: VendorInvoiceBreakdownSummary[]
  _count?: { vendorInvoiceBreakdowns?: number }
  updatedBy?: { name?: string } | string | null
  updatedAt?: string
}

export type VendorInvoiceDetail = Omit<VendorInvoice, "vendorInvoiceBreakdowns"> & {
  vendorInvoiceBreakdowns?: VendorInvoiceBreakdown[]
  vendorInvoiceAttachments?: VendorInvoiceAttachment[]
  updatedBy?: { name: string } | null
  createdBy?: { name: string } | null
}

function formatIdr(value: number) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

export const columns: ColumnDef<VendorInvoice>[] = [
  {
    id: "vendorInvoice",
    accessorFn: (row) =>
      `${row.vendor?.vendorName ?? ""} ${row.vendorInvoiceNumber}`.trim(),
    header: () => <ColumnFilterHeader field="vendor" sortKey="vendor" label="Vendor / Invoice #" />,
    cell: ({ row }) => (
      <Link
        href={`/dashboard/vendor-invoices/${row.original.id}`}
        className="group block min-w-0"
      >
        <span
          className={`${primaryText} flex min-w-0 items-center gap-x-1 group-hover:underline`}
        >
          <span className="truncate">
            {row.original.vendor?.vendorName ?? "Unknown vendor"}
          </span>
          <Info className="size-3.5 shrink-0 text-muted-foreground" />
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {row.original.vendorInvoiceNumber}
        </span>
      </Link>
    ),
  },
  {
    id: "type",
    accessorFn: (row) => row.vendorInvoiceType ?? "",
    header: () => <ColumnFilterHeader field="type" sortKey="type" label="Type" />,
    cell: ({ row }) => <VendorInvoiceTypeChip type={row.original.vendorInvoiceType} />,
  },
  {
    accessorKey: "vendorInvoiceDate",
    header: () => <ColumnFilterHeader field="invoiceMonth" sortKey="invoiceDate" label="Invoice date" />,
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
    accessorFn: (row) => formatVendorInvoiceContainerMix(row.vendorInvoiceBreakdowns),
    header: ({ column }) => sortHeader(column, "Container"),
    ...textSort,
    cell: ({ row }) => (
      <VendorInvoiceContainerMixBadges lines={row.original.vendorInvoiceBreakdowns} />
    ),
  },
  {
    id: "lines",
    accessorFn: (row) =>
      row._count?.vendorInvoiceBreakdowns ?? row.vendorInvoiceBreakdowns?.length ?? 0,
    header: ({ column }) => sortHeader(column, "Lines"),
    ...numberSort,
    cell: ({ row }) => {
      const total =
        row.original._count?.vendorInvoiceBreakdowns ??
        row.original.vendorInvoiceBreakdowns?.length ??
        0
      return <span className={secondaryText}>{total}</span>
    },
  },
  {
    id: "amount",
    accessorFn: (row) =>
      vendorInvoiceInvoiceTotals(row.vendorInvoiceBreakdowns ?? []).net,
    header: ({ column }) => sortHeader(column, "Vendor payable"),
    ...numberSort,
    cell: ({ row }) => {
      const { net } = vendorInvoiceInvoiceTotals(
        row.original.vendorInvoiceBreakdowns ?? []
      )
      return <span className={secondaryText}>{formatIdr(net)}</span>
    },
  },
  {
    accessorKey: "taxInvoice",
    header: () => <ColumnFilterHeader field="taxInvoice" label="Tax invoice" />,
    cell: ({ row }) => (
      <span className={secondaryText}>{row.original.taxInvoice?.trim() || "—"}</span>
    ),
  },
  {
    accessorKey: "status",
    header: () => <ColumnFilterHeader field="status" sortKey="status" label="Status" />,
    cell: ({ row }) => (
      <PaymentStatusChip paid={row.original.status === "PAID"} />
    ),
  },
  {
    accessorKey: "paymentDate",
    header: () => <ColumnFilterHeader field="paymentMonth" sortKey="paymentDate" label="Payment date" />,
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
    header: "Actions",
    cell: ({ row }) => <VendorInvoiceActionCell row={row} />,
  },
]

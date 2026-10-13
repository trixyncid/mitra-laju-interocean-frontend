"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Info } from "lucide-react"
import Link from "next/link"

import { RecordLink } from "@/components/record-link"
import type { VendorInvoiceBreakdownListItem } from "@/services/vendor-invoice.service"
import VendorInvoiceBreakdownActionCell from "@/components/action-cell/vendor-invoice-breakdown-action-cell"
import { PaymentStatusChip } from "@/components/ui/status-chip"
import { primaryText, secondaryText } from "@/lib/design"
import { ColumnFilterHeader } from "@/components/column-filter/column-filter"
import {
  actionColumn,
  numberSort,
  sortHeader,
  textSort,
} from "@/lib/data-table"
import { vendorInvoiceLineGross, localDate } from "@/lib/utils"

function formatIdr(value: number) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
}

export const breakdownColumns: ColumnDef<VendorInvoiceBreakdownListItem>[] = [
  {
    id: "productDescription",
    accessorFn: (row) => row.productDescription,
    header: ({ column }) => sortHeader(column, "Description"),
    ...textSort,
    cell: ({ row }) => (
      <div className="min-w-0 max-w-[240px]">
        <Link
          href={`/dashboard/vendor-invoices/${row.original.vendorInvoiceId}`}
          className={`${primaryText} flex items-center gap-x-1 hover:underline`}
        >
          <span className="truncate">{row.original.productDescription}</span>
          <Info className="size-3.5 shrink-0 text-muted-foreground" />
        </Link>
        {row.original.containerNumber ? (
          <p className="truncate text-xs text-muted-foreground">
            Ctr. {row.original.containerNumber}
            {row.original.containerSize?.name
              ? ` · ${row.original.containerSize.name}`
              : ""}
            {row.original.containerType?.name
              ? ` ${row.original.containerType.name}`
              : ""}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    id: "vendor",
    accessorFn: (row) => row.vendorInvoice.vendor?.vendorName ?? "",
    header: () => <ColumnFilterHeader field="vendor" sortKey="vendor" label="Vendor" />,
    cell: ({ row }) => (
      <span className={secondaryText}>
        {row.original.vendorInvoice.vendor?.vendorName ?? "—"}
      </span>
    ),
  },
  {
    id: "vendorInvoiceNumber",
    accessorFn: (row) => row.vendorInvoice.vendorInvoiceNumber ?? "",
    header: () => <ColumnFilterHeader field="invoiceMonth" sortKey="invoiceDate" label="Invoice # / date" />,
    cell: ({ row }) => (
      <div className="min-w-0">
        <Link
          href={`/dashboard/vendor-invoices/${row.original.vendorInvoiceId}`}
          className={`${secondaryText} hover:underline`}
        >
          {row.original.vendorInvoice.vendorInvoiceNumber || "—"}
        </Link>
        {row.original.vendorInvoice.vendorInvoiceDate ? (
          <p className="text-xs text-muted-foreground">
            {localDate(row.original.vendorInvoice.vendorInvoiceDate)}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    id: "vendorVessel",
    accessorFn: (row) => row.vendorInvoice.vendorVessel ?? "",
    header: ({ column }) => sortHeader(column, "Vessel"),
    ...textSort,
    cell: ({ row }) => (
      <span className={secondaryText}>
        {row.original.vendorInvoice.vendorVessel || "—"}
      </span>
    ),
  },
  {
    id: "amount",
    accessorFn: (row) => vendorInvoiceLineGross(row),
    header: ({ column }) => sortHeader(column, "Line total"),
    ...numberSort,
    cell: ({ row }) => (
      <span className={secondaryText}>
        {formatIdr(vendorInvoiceLineGross(row.original))}
      </span>
    ),
  },
  {
    id: "costing",
    accessorFn: (row) => (row.costing ? row.costing.costingDescription ?? row.productDescription : ""),
    header: () => <ColumnFilterHeader field="costing" label="Costing" />,
    cell: ({ row }) =>
      row.original.costing ? (
        <RecordLink module="COSTING"
          href={`/dashboard/costings?costing=${row.original.costing.id}`}
          className={`${secondaryText} block max-w-[14rem] truncate hover:underline`}
          title={row.original.costing.costingDescription ?? row.original.productDescription}
        >
          {row.original.costing.costingDescription ?? row.original.productDescription}
        </RecordLink>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "status",
    accessorFn: (row) => row.vendorInvoice.status,
    header: () => <ColumnFilterHeader field="status" sortKey="status" label="Payment" />,
    cell: ({ row }) => (
      <PaymentStatusChip paid={row.original.vendorInvoice.status === "PAID"} />
    ),
  },
  {
    ...actionColumn,
    header: "Actions",
    cell: ({ row }) => <VendorInvoiceBreakdownActionCell row={row} />,
  },
]

"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"

import { ColumnFilterHeader } from "@/components/column-filter/column-filter"
import { InvoiceRowActions } from "@/components/customer-invoices/invoice-row-actions"
import { INVOICE_STATUS_TONE, invoiceTotals } from "@/components/customer-invoices/invoice-format"
import { formatIdr } from "@/components/dashboard/overview-card"
import { RecordLink } from "@/components/record-link"
import { secondaryText } from "@/lib/design"
import { actionColumn } from "@/lib/data-table"
import { INVOICE_STATUS_LABEL, INVOICE_TYPE_LABEL, type CustomerInvoice } from "@/lib/types/customer-invoice"
import { cn, localDate } from "@/lib/utils"
import { vesselLabel } from "@/lib/shipment-reference"

/** Whole rupiah for dense tables; the exact amount is in the tooltip. */
function formatWholeIdr(value: number) {
  return value.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
}

const dateCell = (value: string | null) =>
  value ? <span className={cn(secondaryText, "whitespace-nowrap")}>{localDate(value)}</span> : <span className={secondaryText}>—</span>

export const columns: ColumnDef<CustomerInvoice>[] = [
  {
    id: "invoiceNumber",
    header: () => <ColumnFilterHeader sortKey="invoiceNumber" label="Invoice #" />,
    cell: ({ row }) => (
      <Link
        href={`/dashboard/customer-invoices/${row.original.id}`}
        className="font-mono text-[13px] font-semibold whitespace-nowrap text-foreground hover:underline"
      >
        {row.original.customerInvoiceNumber}
      </Link>
    ),
  },
  {
    id: "customer",
    header: () => <ColumnFilterHeader field="customer" sortKey="customer" label="Customer" />,
    cell: ({ row }) => {
      const sales = row.original.sales
      const name = sales.customer?.customerName ?? sales.shipment?.customerCode?.customerName
      return name ? (
        <div className="flex min-w-0 max-w-[14rem] flex-col">
          <span className="truncate text-foreground">{name}</span>
          {sales.customer?.customerCode ? <span className="text-xs text-muted-foreground">{sales.customer.customerCode}</span> : null}
        </div>
      ) : (
        <span className={secondaryText}>No customer</span>
      )
    },
  },
  {
    id: "status",
    header: () => <ColumnFilterHeader field="status" label="Status" />,
    cell: ({ row }) => (
      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", INVOICE_STATUS_TONE[row.original.customerInvoiceStatus])}>
        {INVOICE_STATUS_LABEL[row.original.customerInvoiceStatus]}
      </span>
    ),
  },
  {
    id: "amount",
    header: () => (
      <span className="block text-right" title="What the customer pays: before tax + VAT − PPh 23">
        Amount due
      </span>
    ),
    cell: ({ row }) => {
      const { due } = invoiceTotals(row.original.sellings)
      return (
        <span className="block text-right font-semibold whitespace-nowrap tabular-nums text-foreground">
          {row.original.sellings.length ? <span title={formatIdr(due)}>{formatWholeIdr(due)}</span> : "—"}
        </span>
      )
    },
  },
  {
    id: "invoiceDate",
    header: () => <ColumnFilterHeader field="invoiceDate" sortKey="invoiceDate" label="Invoice date" />,
    cell: ({ row }) => dateCell(row.original.customerInvoiceDate),
  },
  {
    id: "paymentDate",
    header: () => <ColumnFilterHeader field="paymentDate" sortKey="paymentDate" label="Payment date" />,
    cell: ({ row }) => dateCell(row.original.paymentDate),
  },
  {
    id: "type",
    header: () => <ColumnFilterHeader field="type" label="Type" />,
    cell: ({ row }) => (
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
          row.original.customerInvoiceType === "REIMBURSEMENT" ? "bg-muted text-muted-foreground" : "bg-secondary text-secondary-foreground"
        )}
      >
        {INVOICE_TYPE_LABEL[row.original.customerInvoiceType]}
      </span>
    ),
  },
  {
    id: "taxInvoice",
    header: () => <ColumnFilterHeader field="taxInvoice" label="Tax invoice" />,
    cell: ({ row }) =>
      row.original.taxInvoice ? (
        <div className="flex flex-col">
          <span className="font-mono text-xs whitespace-nowrap text-foreground">{row.original.taxInvoice}</span>
          {row.original.taxInvoiceDate ? (
            <span className="text-xs text-muted-foreground">{localDate(row.original.taxInvoiceDate)}</span>
          ) : null}
        </div>
      ) : (
        <span className={secondaryText}>—</span>
      ),
  },
  {
    id: "sales",
    header: () => <span>Sales job</span>,
    cell: ({ row }) => {
      const sales = row.original.sales
      const vessel = vesselLabel(sales.shipment?.shipmentOperational?.vessel)
      return (
        <div className="flex min-w-0 flex-col">
          <RecordLink
            module="SALES"
            href={`/dashboard/sales/${sales.id}`}
            className="font-mono text-xs whitespace-nowrap text-foreground hover:underline"
          >
            {sales.salesNumber}
          </RecordLink>
          {vessel ? <span className="truncate text-xs text-muted-foreground">{vessel}</span> : null}
        </div>
      )
    },
  },
  {
    ...actionColumn,
    header: "Actions",
    cell: ({ row }) => <InvoiceRowActions invoice={row.original} />,
  },
]
